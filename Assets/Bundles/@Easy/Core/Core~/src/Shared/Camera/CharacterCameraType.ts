export enum CharacterCameraType {
    /** Camera that renders your view model (held item / hands in first person). */
    VIEW_MODEL,
    /** Camera that renders the world while in first person. This does not include your view model. */
    FIRST_PERSON,
    /** Camera that renders the world while in third person. */
    THIRD_PERSON,
}