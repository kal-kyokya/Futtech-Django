from django.test import SimpleTestCase
from rest_framework.test import APIClient
from .agents import ChiefAnalystAgent, ContentStrategistAgent, ResearcherAgent, TacticalAnalystAgent
from .orchestrator import FuttechXIOrchestrator, WorkflowError


class FuttechXITests(SimpleTestCase):
    def setUp(self):
        self.client = APIClient()

    def test_agents_are_constructible(self):
        self.assertEqual(ResearcherAgent().name, "researcher")
        self.assertEqual(TacticalAnalystAgent().name, "tactician")
        self.assertEqual(ContentStrategistAgent().name, "content-strategist")
        self.assertEqual(ChiefAnalystAgent().name, "chief-analyst")

    def test_research_output_is_evidence_aware(self):
        result = ResearcherAgent().run("Analyze Barcelona's attack")

        self.assertTrue(result.findings)
        self.assertEqual(len(result.findings), len(result.evidence))
        self.assertTrue(result.limitations)

    def test_tactical_and_content_execution(self):
        research = ResearcherAgent().run("Barcelona attack")
        tactical = TacticalAnalystAgent().run(research)
        content = ContentStrategistAgent().run(research, tactical)

        self.assertTrue(tactical.interpretations)
        self.assertEqual(4, len(content.ideas))
        self.assertEqual(3, len([x for x in content.ideas if x.format == "short-form"]))

    def test_chief_removes_unsupported_findings(self):
        research = ResearcherAgent().run("Barcelona attack")
        research.findings.append("Unsupported live claim")
        tactical = TacticalAnalystAgent().run(research)
        content = ContentStrategistAgent().run(research, tactical)
        report = ChiefAnalystAgent().run(research, tactical, content)

        self.assertNotIn("Unsupported live claim", report.key_findings)

    def test_complete_workflow(self):
        outcome = FuttechXIOrchestrator().analyze("Analyze Barcelona's attacking strengths and suggest three content ideas.")

        self.assertEqual(outcome["status"], "completed")
        self.assertEqual(len(outcome["agents"]), 4)
        self.assertIn("confidence", outcome["report"])

    def test_health_check(self):
        self.assertEqual(self.client.get("/healthz").status_code, 200)

    def test_api_validation_and_demo(self):
        self.assertEqual(400, self.client.post("/api/futtech-xi/analyze", {}, format="json").status_code)

        response = self.client.post("/api/futtech-xi/analyze", {"query": "Analyze Barcelona's attacking strengths."}, format="json")

        self.assertEqual(200, response.status_code)
        self.assertEqual("completed", response.data["status"])

    def test_agent_failure_is_safe(self):
        class Broken:
            name = "researcher"

            def run(self, query):
                raise ValueError("do not leak")

        with self.assertRaises(WorkflowError):
            FuttechXIOrchestrator(researcher=Broken()).analyze("Analyze Barcelona")
