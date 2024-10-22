interface ScrappedCourseFromProfessor {
  year: string
  courseCode: string
}

export interface ScrappedProfessorCourse {
  [key: string]: ScrappedCourseFromProfessor[]
}
