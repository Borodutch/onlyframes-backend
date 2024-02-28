interface PersistentFile {
  lastModifiedDate: Date
  filepath: string
  newFilename: string
  originalFilename: string
  mimetype: string
  hashAlgorithm: boolean | string
  size: number
}

export default PersistentFile
