const PAPER_TITLE = `{{topic_title}}_Paper.md`;
const PAPER_CONTENT = `---
tags:
- topic/{{topic_title}}
- class/{{tag_class}}
- type/reaction_paper
---

![[{{topic_title}}.canvas]]

\`\`\`dataview
table authors, year from #topic/{{topic_title}} sort year asc
\`\`\`
---`;

const CANVAS_TITLE = `{{topic_title}}.canvas`;
const CANVAS_CONTENT = `{
	"nodes":[],
	"edges":[]
}`;

const ANNOTATION_TITLE = `{{paper_title}}_{{paper_year}}_Annotated.md`;
const ANNOTATION_CONTENT = `---
annotation-target: {{paper_title}}_{{paper_year}}.pdf
authors:
  - Koperski, Jake
year: {{paper_year}}
tags:
  - type/annotation
  - class/{{tag_class}}
  - topic/{{topic_title}}
---`;

export {
	PAPER_TITLE,
	PAPER_CONTENT,
	CANVAS_TITLE,
	CANVAS_CONTENT,
	ANNOTATION_TITLE,
	ANNOTATION_CONTENT,
};
