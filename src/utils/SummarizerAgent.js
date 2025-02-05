import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { HtmlToTextTransformer } from "@langchain/community/document_transformers/html_to_text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ChatOpenAI } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Document } from "@langchain/core/documents";

export default class SummarizerAgent {
  /**
   * @type {ChatOpenAI}
   */
  #llm;

  /**
   * @type {string}
   */
  #selector;

  /**
   * @type {number}
   */
  #maxWords;

  /**
   * @type {string}
   */
  #targetAudience;

  /**
   *
   * @param {{ llm: ChatOpenAI, selector: string }} config
   */
  constructor({ llm, selector, maxWords, targetAudience } = {}) {
    this.#llm = llm;
    this.#selector = selector || 'h1, h2, h3, h4, h5, h6, p, li';
    this.#maxWords = maxWords || 250;
    this.#targetAudience = targetAudience || 'product management';

    if (!llm) {
      this.#llm = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4o-mini',
        temperature: 0,
      });
    }
  }

  async #loadUrlContext(url) {
    const loader = new CheerioWebBaseLoader(url, {
      selector: this.#selector,
    });

    return loader.load();
  }

  async #splitHtmlContext(htmlDocs) {
    const splitter = RecursiveCharacterTextSplitter.fromLanguage("html", {
        chunkSize: 2000,
        chunkOverlap: 100,
    });
    const transformer = new HtmlToTextTransformer();

    return await splitter.pipe(transformer).invoke(htmlDocs);
  }

  async #loadStoryContext(story) {
    return [
      `<title>${story.title}</title>`,
      `<author>${story.by}</author>`,
      `<content>${story.text}</content>`,
    ].join('\n');
  }

  async #splitTextContext(text) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 100,
    });

    return splitter.splitDocuments([new Document({ pageContent: text })]);
  }

  #makeSummaryPromptTemplate() {
    return ChatPromptTemplate.fromMessages([
      ['system', 'You are an expert summarizer and analyzer who can help me.'],
      ['human', [
        'Generate a concise and coherent summary from the given Context.',
        'Condense the context into a well-written summary that captures the main themes, ideias, key points, and insights presented in the context.',
        'Prioritize clarity and brevity while retaining the essential information.',
        'Aim to convey the context\'s core message and any supporting details that contribute to a comprehensive understanding.',
        'Craft the summary to be self-contained, ensuring that readers can grasp the content even if they haven\'t read the context.',
        'Provide context where necessary and avoid excessive technical jargon or verbosity.',
        'The goal is to create a summary that effectively communicates the context\'s content while being easily digestible and engaging.',
        'Summary should NOT be more than {word_count} words for {target_audience} audience.',
        'Summary should be structured in a hierarchy a bullet point list written in Markdown format.',
        'Use bold or italic formatting to highlight important information.',
        'NEVER include personal opinions, prefixes, suffixes or unrelated information in the summary.',
        'CONTEXT: {context}',
        '\n---\n',
        'SUMMARY: \n',
      ].join('\n')],
    ]);
  }

  async summarizeStory(story) {
    let contextDocs = null;

    if (story.url) {
      const wholeDoc = await this.#loadUrlContext(story.url);
      contextDocs = await this.#splitHtmlContext(wholeDoc);
    } else {
      const wholeDoc = await this.#loadStoryContext(story);
      contextDocs = await this.#splitTextContext(wholeDoc);
    }

    const chain = await createStuffDocumentsChain({
        llm: this.#llm,
        outputParser: new StringOutputParser(),
        prompt: this.#makeSummaryPromptTemplate(),
    });

    return chain.invoke({
      context: contextDocs,
      word_count: this.#maxWords,
      target_audience: this.#targetAudience,
    });
  }
}
