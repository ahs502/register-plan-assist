export default interface ModelConvertable<M> {
  extractModel(override?: (model: M) => M): M;
}
