import ExcelJS from "exceljs"
import Papa from "papaparse"

export interface ImportedQuestion {
  questionText: string
  options: string[]
  correctAnswer: number
}

const supportedExtensions = [".json", ".csv", ".xlsx"] as const

const normalizeHeader = (value: string) => value.trim().toLowerCase().replace(/[\s_-]/g, "")

const textValue = (value: unknown) => {
  if (value === null || value === undefined) return ""
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value).trim()

  if (typeof value === "object" && value !== null && "text" in value) {
    return String(value.text ?? "").trim()
  }

  return String(value).trim()
}

const parseCorrectAnswer = (value: unknown, questionNumber: number) => {
  const correctAnswer = Number(textValue(value))
  if (!Number.isInteger(correctAnswer) || correctAnswer < 1 || correctAnswer > 4) {
    throw new Error(`Question ${questionNumber}: correctAnswer must be a whole number from 1 to 4.`)
  }

  return correctAnswer
}

const parseOptions = (value: unknown, questionNumber: number) => {
  if (Array.isArray(value)) return value.map(textValue)

  const rawOptions = textValue(value)
  if (!rawOptions) return []

  try {
    const parsedOptions: unknown = JSON.parse(rawOptions)
    if (Array.isArray(parsedOptions)) return parsedOptions.map(textValue)
  } catch {
    throw new Error(`Question ${questionNumber}: options must be an array or a JSON-encoded array.`)
  }

  throw new Error(`Question ${questionNumber}: options must be an array or a JSON-encoded array.`)
}

const normalizeQuestion = (value: unknown, questionNumber: number): ImportedQuestion => {
  if (!value || typeof value !== "object") {
    throw new Error(`Question ${questionNumber} is not a valid object.`)
  }

  const record = value as Record<string, unknown>
  const questionText = textValue(record.questionText ?? record.question_text ?? record.question)
  const rawOptions = record.options
  const options = rawOptions !== undefined && rawOptions !== null
    ? parseOptions(rawOptions, questionNumber)
    : [record.option_1, record.option_2, record.option_3, record.option_4].map(textValue)

  if (!questionText) {
    throw new Error(`Question ${questionNumber}: questionText is required.`)
  }

  if (options.length !== 4 || options.some((option) => !option)) {
    throw new Error(`Question ${questionNumber}: four non-empty options are required.`)
  }

  return {
    questionText,
    options,
    correctAnswer: parseCorrectAnswer(record.correctAnswer ?? record.correct_answer, questionNumber),
  }
}

const parseJson = (text: string) => {
  let parsed: unknown

  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error("The JSON file is not valid.")
  }

  const questions = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object" && Array.isArray((parsed as { questions?: unknown }).questions)
      ? (parsed as { questions: unknown[] }).questions
      : null

  if (!questions) {
    throw new Error("The JSON file must contain a questions array.")
  }

  return questions.map((question, index) => normalizeQuestion(question, index + 1))
}

const rowsToQuestions = (rows: Record<string, unknown>[]) => {
  if (rows.length === 0) throw new Error("The file does not contain any questions.")

  return rows.map((row, index) => {
    const normalizedRow = Object.fromEntries(
      Object.entries(row).map(([key, value]) => [normalizeHeader(key), value])
    )

    return normalizeQuestion(
      {
        questionText: normalizedRow.questiontext ?? normalizedRow.question,
        options: normalizedRow.options,
        option_1: normalizedRow.option1,
        option_2: normalizedRow.option2,
        option_3: normalizedRow.option3,
        option_4: normalizedRow.option4,
        correctAnswer: normalizedRow.correctanswer,
      },
      index + 1
    )
  })
}

const parseCsv = async (file: File) => {
  const text = await file.text()
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim(),
  })

  if (result.errors.length > 0) {
    throw new Error(`The CSV file could not be parsed: ${result.errors[0].message}`)
  }

  return rowsToQuestions(result.data)
}

const parseXlsx = async (file: File) => {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(await file.arrayBuffer())

  const worksheet = workbook.worksheets[0]
  if (!worksheet) throw new Error("The Excel file does not contain a worksheet.")

  const rows: unknown[][] = []
  worksheet.eachRow({ includeEmpty: false }, (row) => {
    rows.push((row.values as unknown[]).slice(1))
  })

  if (rows.length < 2) throw new Error("The Excel file does not contain any questions.")

  const headers = rows[0].map(textValue)
  const dataRows = rows.slice(1).map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index]]))
  )

  return rowsToQuestions(dataRows)
}

export const isSupportedCollectionImport = (fileName: string) => {
  const lowerName = fileName.toLowerCase()
  return supportedExtensions.some((extension) => lowerName.endsWith(extension))
}

export const parseCollectionImport = async (file: File): Promise<ImportedQuestion[]> => {
  const lowerName = file.name.toLowerCase()

  if (lowerName.endsWith(".json")) return parseJson(await file.text())
  if (lowerName.endsWith(".csv")) return parseCsv(file)
  if (lowerName.endsWith(".xlsx")) return parseXlsx(file)

  throw new Error("Choose a JSON, CSV, or Excel (.xlsx) file.")
}
