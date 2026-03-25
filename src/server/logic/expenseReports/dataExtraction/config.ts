import { LanguageModel } from "ai"

type DataExtractionConfig = {
    model: LanguageModel
    temperature: number
}

export const DataExtractionConfig: DataExtractionConfig = {
    model: "openai/gpt-5.2",
    temperature: 0,
}