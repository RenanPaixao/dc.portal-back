import { searchByCourses } from '../course/courseFunctions.js'
import { searchByProfessors } from '../professor/professorFunctions.js'
import type { ReqQueryParams } from '../types.js'

export const search = async (term: string, options?: ReqQueryParams) => {
  const coursesResult = await searchByCourses(term, options)
  const professorsResult = await searchByProfessors(term, options)

  return {
    courses: coursesResult,
    professors: professorsResult,
  }
}
