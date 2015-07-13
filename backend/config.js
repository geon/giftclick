
// Changes in here should not normally be committed.
// You can still modify it locally for tests etc with `--skip-worktree`.
// git update-index --skip-worktree config.js
// http://git-scm.com/docs/git-update-index#_skip_worktree_bit
// http://stackoverflow.com/questions/11131197/undo-git-update-index-skip-worktree

module.exports = {
	connectionString: 'postgres://username:password@localhost:5432/giftclick',
	adminPassword: 'password'
};
