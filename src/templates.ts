const PAPER_TITLE = `{{titleTopic}}_Paper.md`;
const PAPER_CONTENT = `---
tags:
- topic/{{tagTopic}}
- class/{{tagClass}}
- type/reaction_paper
---
![[{{titleTopic}}.canvas]]
\`\`\`dataview
table authors, year from #topic/{{tagTopic}} sort year asc
\`\`\`
`;

const CANVAS_TITLE = `{{titleTopic}}.canvas`;

const ANNOTATION_TITLE = `{{titleArticle}}_Annotated.md`;
const ANNOTATION_CONTENT = `---
annotation-target: {{fileArticle}}
authors:
  - Koperski, Jake
year: {{tagYear}}
tags:
  - topic/{{tagTopic}}
  - class/{{tagClass}}
  - type/annotation
---`;

export {
	PAPER_TITLE,
	PAPER_CONTENT,
	CANVAS_TITLE,
	ANNOTATION_TITLE,
	ANNOTATION_CONTENT,
};
