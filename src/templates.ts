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

const ANNOTATION_TITLE = `{{titleArticle}}.md`;
const ANNOTATION_CONTENT = `---
authors:
  - Unknown
title:
year: {{tagYear}}
tags:
  - topic/{{tagTopic}}
  - class/{{tagClass}}
  - type/annotation
summary:
---
![[{{fileArticle}}]]

`;

export {
	NOTES_TITLE,
	NOTES_CONTENT,
	CANVAS_TITLE,
	ANNOTATION_TITLE,
	ANNOTATION_CONTENT,
};
