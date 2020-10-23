module.exports = {

  // Creates unique Id for each user - compound key of both team and user Ids
  getUID(team, user) {
    return `${team}/${user}`;
  },

  // Check if the string is a mention string
  isMentionId(str) {
    return /<@U[\d\w]+>/i.test(str)
  },

  // Gets the user Id from mention string
  getMentionId(str) {
    return /<@(U[\d\w]+)>/i.exec(str)[1];
  },

  allTrue(array) {
    return array.filter(e => !e).length == 0
  }
}