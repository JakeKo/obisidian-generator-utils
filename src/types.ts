type TopicProps = {
	titleTopic: string;
	tagTopic: string;
	tagClass: string;
	pathArticles: string[];
};

type AnnotationProps = {
	titleArticle: string;
	fileArticle: string;
	tagYear: number;
	tagTopic: string;
	tagClass: string;
};

export type { TopicProps, AnnotationProps };
