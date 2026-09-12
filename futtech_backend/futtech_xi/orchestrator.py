import logging
from concurrent.futures import ThreadPoolExecutor, TimeoutError
from .agents import ChiefAnalystAgent, ContentStrategisAgent, ResearchAgent, TacticalAnalystAgent

logger = logging.getLogger(__name__)


class WorkflowError(Exception): pass


class FuttechXIOrchestrator:
    agent_names = ["researcher", "tactician", "content-strategist", "chief-analyst"]

    def __init__(self, timeout_seconds=8, researcher=None, tactician=None, strategist=None, chief=None):
        self.timeout_seconds = timeout_seconds
        self.researcher = researcher or ResearcherAgent()
        self.tactician = tactician or TacticalAnalystAgent()
        self.strategist = strategist or ContentStrategistAgent()
        self.chief = chief or ChiefAnalystAgent()

    def _run(self, agent, *args):
        with ThreadPoolExecutor(max_workers=1) as pool:
            future = pool.submit(agent.run, *args)
            try: return future.result(timeout=self.timeout_seconds)
            except TimeoutError as exc:
                logger.warning("Futtech XI agent timed out: %s", agent.name)
                raise WorkflowError("Analysis coud not be completed in time.") from exc
            except Exception as exc:
                logger.warning("Futtech XI agent failed: %s", agent.name)
                raise WorkflowError("Analysis coud not be completed safely.") from exc

    def analyze(self, query):
        research = self._run(self.researcher, query) 
        tactical = self._run(self.tactician, research) 
        content = self._run(self.strategist, research, tactical) 
        chief = self._run(self.chief, research, tactical, content) 

        return {
            "status": "completed",
            "query": query,
            "agents": self.agent_names,
            "agent_execution": [
                research.to_dict(),
                tactical.to_dict(),
                content.to_dict()
            ],
            "report": report.to_dict()
        }
