export const PUBLIC_FIELDS = 'name age photo bio city interests';

export const toPublic = ({ likedMe, ...rest }) => rest;