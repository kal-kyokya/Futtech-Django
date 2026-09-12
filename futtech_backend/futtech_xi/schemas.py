from dataclasses import asdict, dataclass, field
from typing import Literal


@dataclass
class Evidence:
    claim: str
    source: str
    confirmed: bool = True


@dataclass
class ResearchResult:
    agent: str = "researcher"
    status: str = "completed"
    topic: str = "Football topic"
    findings: list[str] = field(default_factory=list)
    evidence: list[Evidence] = field(default_factory=list)
    assumptions: list[str] = field(default_factory=list)
    confidence: float = 0.0
    limitations: list[str] = field(default_factory=list)

    def to_dict(self): return asdict(self)


@dataclass
class TacticalResult:
    agent: str = "tactician"
    status: str = "completed"
    observations: list[str] = field(default_factory=list)
    interpretations: list[str] = field(default_factory=list)
    reasoning: list[str] = field(default_factory=list)
    confidence: float = 0.0
    limitations: list[str] = field(default_factory=list)

    def to_dict(self): return asdict(self)


@dataclass
class ContentIdea:
    format: Literal["short-form", "tactical-analysis"]
    title: str
    hook: str
    insight: str
    visual_treatment: str


@dataclass
class ContentResult:
    agent: str = "content-strategist"
    status: str = "completed"
    ideas: list[ContentIdea] = field(default_factory=list)
    confidence: float = 0.0
    limitations: list[str] = field(default_factory=list)

    def to_dict(self): return asdict(self)


@dataclass
class FinalReport:
    match: str
    key_findings: list[str]
    tactical_story: str
    content_opportunities: list[dict]
    limitations: list[str]
    confidence: float

    def to_dict(self): return asdict(self)
