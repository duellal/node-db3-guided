const db = require('../../data/db-config.js')

module.exports = {
  findPosts,
  find,
  findById,
  add,
  remove
}

async function findPosts(user_id) {
  /*
    Implement so it resolves this structure:

    [
      {
          "post_id": 10,
          "contents": "Trusting everyone is...",
          "username": "seneca"
      },
      etc
    ]
  */
/*
 select 
p.id as post_id,
contents,
username
from posts as p
join users as u
on p.user_id = u.id
*/
const rows = await db('posts as p')
    .select('p.id as post_id', 'contents', 'username')
    .join('users as u', `p.user_id`, `=`, `u.id`)
    .where('u.id', user_id)

    return rows
}


async function find() {
  const users = await db('users as u')
    .leftJoin('posts as p', 'u.id', '=', 'p.user_id')
    .count('p.id as post_count')
    .groupBy('u.id')
    .select('u.id as user_id', 'username')

    return users
    /*
    Improve so it resolves this structure:

    [
        {
            "user_id": 1,
            "username": "lao_tzu",
            "post_count": 6
        },
        {
            "user_id": 2,
            "username": "socrates",
            "post_count": 3
        },
        etc
    ]
  */
}

async function findById(id) {
  const userId = await db('users as u')
    .leftJoin('posts as p', 'u.id', 'p.user_id')
    .select(
      'u.id as user_id', 
      'username', 
      'contents', 
      'p.id as post_id')
    .where('u.id', id)

    let result = userId.reduce((acc, row) => {
      if (row.contents){
        acc.posts.push({contents: row.contents, post_id: row.post_id})
      }
      return acc
      }, {user_id: userId[0].user_id, username:userId[0].username, posts: []})

  return result
  /*
    Improve so it resolves this structure:

    {
      "user_id": 2,
      "username": "socrates"
      "posts": [
        {
          "post_id": 7,
          "contents": "Beware of the barrenness of a busy life."
        },
        etc
      ]
    }
  */
}

function add(user) {
  return db('users')
    .insert(user)
    .then(([id]) => { // eslint-disable-line
      return findById(id)
    })
}

function remove(id) {
  // returns removed count
  return db('users').where({ id }).del()
}
