export const filterTags = (tags: Array<string>, tagsPrefix: string) => {
  const filteredTags = tags?.filter((tag) => tag.startsWith(tagsPrefix)) || [];
  return (
    filteredTags?.map((filteredTag) => filteredTag.replace(tagsPrefix, "")) ||
    []
  );
};
