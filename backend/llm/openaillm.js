import {ChatOpenAI} from "@langchain/openai";

const openaillm = new ChatOpenAI({
    model: process.env.OPENAI_MODEL,
    temperature: 0
});

export default openaillm;