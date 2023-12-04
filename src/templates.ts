const PAPER_TITLE = `{{titleTopic}}_Paper.md`;
const PAPER_CONTENT = `---
tags:
- topic/{{tagTopic}}
- class/{{tagClass}}
- type/reaction_paper
---
![[{{titleTopic}}.canvas]]
\`\`\`dataview
table title, year, summary from #topic/{{tagTopic}} and #class/{{tagClass}} and #type/annotation sort year asc
\`\`\`
`;

const NOTES_TITLE = `{{titleTopic}}_Notes.md`;
const NOTES_CONTENT = `---
tags:
- topic/{{tagTopic}}
- class/{{tagClass}}
- type/class_notes
---
![[{{titleTopic}}.canvas]]
\`\`\`dataview
table title, year, summary from #topic/{{tagTopic}} and #class/{{tagClass}} and #type/annotation sort year asc
\`\`\`
`;

const CANVAS_TITLE = `{{titleTopic}}.canvas`;

const ANNOTATION_TITLE = `{{titleArticle}}_Annotated.md`;
const ANNOTATION_CONTENT = `---
annotation-target: {{fileArticle}}
authors:
  - Koperski, Jake
title:
year: {{tagYear}}
tags:
  - topic/{{tagTopic}}
  - class/{{tagClass}}
  - type/annotation
summary:
---`;

export {
	PAPER_TITLE,
	PAPER_CONTENT,
	NOTES_TITLE,
	NOTES_CONTENT,
	CANVAS_TITLE,
	ANNOTATION_TITLE,
	ANNOTATION_CONTENT,
};
