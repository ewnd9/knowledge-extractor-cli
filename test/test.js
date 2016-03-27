import test from 'ava';
import 'babel-core/register';

import execa from 'execa';

test('open file', async t => {
  const dir = `/tmp/${Math.random()}`;

  console.log(dir);

  await execa.shell(`mkdir -p ${dir}/src && cd ${dir} && git init && git remote add origin ${dir} && cd ${dir}/src && touch index.js && touch data.js`);

  const { stdout: s1 } = await execa.shell(`cd ${dir} && node "${__dirname}/../cli" "**/*.js"`);
  const { stdout: s2 } = await execa.shell(`cd ${dir} && node "${__dirname}/../cli" "**/*.js"`);

  t.ok(new RegExp('2 left').test(s1));
  t.ok(new RegExp('1 left').test(s2));
});
