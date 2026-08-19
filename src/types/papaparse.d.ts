declare module "papaparse" {
  interface ParseError {
    message: string
  }

  interface ParseResult<T> {
    data: T[]
    errors: ParseError[]
  }

  interface ParseConfig<T> {
    header?: boolean
    skipEmptyLines?: boolean | "greedy"
    transformHeader?: (header: string, index: number) => string
  }

  const Papa: {
    parse<T>(input: string, config: ParseConfig<T>): ParseResult<T>
  }

  export default Papa
}
