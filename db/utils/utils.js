exports.formatDates = list => {
  if (list === undefined) return [];
  return list.map(article => {
    const newArticle = { ...article };
    newArticle.created_at = new Date(newArticle.created_at);
    return newArticle;
  });
};

exports.makeRefObj = list => {
  const refObj = {};
  list.forEach(obj => {
    return (refObj[obj.title] = obj.article_id);
  });
  return refObj;
};

exports.formatComments = (comments, articleRef) => {
  if (!comments.length) return [];
  return comments.map(comment => {
    const { created_by, belongs_to, created_at, ...keys } = comment;
    const obj = {
      author: created_by,
      article_id: articleRef[belongs_to],
      created_at: new Date(created_at),
      ...keys
    };
    return obj;
  });
};
