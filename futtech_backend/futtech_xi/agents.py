"""
Deterministic agents with explicit typed hand-offs.

JarvisCore remains the project's agent-framework dependency; this offline demo
uses local deterministic runners so normal API and test execution never need an
LLM key.
The typed contracts here can be used as JarvisCore tool/output contracts when
an LLM runner is enabled in future deployment.
"""

from jarviscore import Agent
from .schemas import ContentIdea, ContentResult, Evidence, FinalReport, ResearchResult, TacticalResult

CURATED_TEAMS = {
    "barcelona": {
        "topic": "FC Barcelona (curated demonstration profile)",
        "facts": [
            "The curated profile describes Barcelona using wide players to stretch the defensive line.",
            "The curated profile describes midfield rotations that create central passing options.",
            "The curated profile notes that losing the ball with full-backs advanced can expose transition space.",
        ],
        "source": "Futtech XI curated demonstration dataset v1 (not live match data)",
    },
}


class DeterministicAgent(Agent):
    """
    JarvisCore Agent adapter for deterministic, single-service runner.
    """
    async def execute_task(self, task):
        args = task.get("args", [])
        return {
            "status": "success",
            "output": self.run(*args)
        }


class ResearcherAgent(DeterministicAgent):
    role = "researcher"
    capabilities = ["football-research"]
    name = "researcher"

    def run(self, query: str) -> ResearchResult:
        profile = next((item for key, item in CURATED_TEAMS.items() if key in query.lower()), None)
        if not profile:
            return ResearchResult(
                topic="Unverified football topic",
                confidence=0.2,
                limitations=["No live research provider is configured.", "The query did not match the small curated demonstration dataset."],
                assumptions=["Any tactical discussion is a general framework, not a claim about a current team or match"]
            )

        return ResearchResult(
            topic=profile["topic"],
            findings=profile["facts"],
            evidence=[Evidence(claim=fact, source=profile["source"]) for fact in profile["facts"]],
            confidence=0.72,
            limitations=["This is a curated demonstration profile, not verified live football data.", "It contains no current results, injuries, standings, or player statistics."]
        )


class TacticalAnalystAgent(DeterministicAgent):
    role = "tactician"
    capabilities = ["tactical-analysis"]
    name = "tactician"

    def run(self, research: ResearchResult) -> TacticalResult:
        if not research.findings:
            return TacticalResult(
                status="degraded",
                confidence=0.15,
                limitations=research.limitations + ["No supported factual findings were available for team-specific tactical analysis."]
            )

        return TacticalResult(
            observations=research.findings,
            interpretations=[
                "The stated width and midfield rotations can create overloads between an opponent's lines.",
                "The stated advanced full-back positioning can make the first defensive transition a priority after possession loss."
            ],
            reasoning=["Each interpretation is derived only from the corresponding curated observation; it is not a claim about a specific live match."],
            confidence=0.64,
            limitations=list(research.limitations)
        )


class ContentStrategistAgent(DeterministicAgent):
    role = "content-strategist"
    capabilities = ["football-content"]
    name = "content-strategist"

    def run(self, research: ResearchResult, tactical: TacticalResult) -> ContentResult:
        theme = "the width-to-midfield rotation" if research.findings else "how to evaluate a football question responsibly"
        ideas = [
            ContentIdea("short-form", "Freeze-frame the overload", "Why does this passing lane suddenly appear", f"Show {theme} in three frames", "Use a simple animated pitch and clearly label it as a conceptual demonstration."),
            ContentIdea("short-form", "The five-second transition", "Attack over — now who protects the middle?", "Connect attacking positioning to immediate counter-press responsibilities.", "Use arrows, a five-second timer, and generic training footage."),
            ContentIdea("short-form", "One rotation, two options", "A small rotation can change the whole picture.", "Show the central and wide option created by a rotation.", "Split-screen animated pitch; avoid implying unverified match footage."),
            ContentIdea("tactical-analysis", "Building attacks without losing rest defence", "Can a team keep its attacking shape and still be safe?", "Examine the trade-off between overload creation and transition coverage.", "Long-form whiteboard sequence with a possesion-to-transition animation."),
        ]
        return ContentResult(
            ideas=ideas,
            confidence=min(research.confidence, tactical.confidence),
            limitations=list(set(research.limitations + tactical.limitations))
        )


class ChiefAnalystAgent(DeterministicAgent):
    role = "chief-analyst"
    capabilities = ["quality-control", "report-synthesis"]
    name = "chief-analyst"

    def run(self, research: ResearchResult, tactical: TacticalResult, content: ContentResult) -> FinalReport:
        # QC: retain only findings with an exact confirmed evidence claim, and downgrade failed/degraded hand-offs.
        supported = {item.claim for item in research.evidence if item.confirmed}
        findings = [item for item in research.findings if item in supported]
        limitations = list(dict.fromkeys(research.limitations + tactical.limitations + content.limitations))

        if len(findings) != len(research.findings):
            limitations.append("Quality control removed research claims without confirmed evidence.")
        if any(result.status != "completed" for result in (research, tactical, content)):
            limitations.append("One or more agent hand-offs were degraded; unsupported conclusions were withheld.")

        story = ("The available curated evidence suggests width and midfield rotations may create attacking options, "
                 "while advanced positioning requires transition protection.") if findings else ("No team-specific tactical conclusion is published because the available evidence is insufficient.")

        confidence = round(min(research.confidence, tactical.confidence, content.confidence) * (0.9 if limitations else 1), 2)

        return FinalReport(
            match=research.topic,
            key_findings=findings,
            tactical_story=story,
            content_opportunities=[idea.__dict__ for idea in content.ideas],
            limitations=limitations,
            confidence=confidence
        )
