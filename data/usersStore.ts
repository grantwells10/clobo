const initial = require('./users.json');

let users = Array.isArray(initial) ? initial.slice() : [];

type Subscriber = () => void;
const subs: Subscriber[] = [];

export function getUsers() {
  return users.slice();
}

export function setUsers(newUsers: any[]) {
  users = newUsers.slice();
  subs.forEach((s) => s());
}

export function addFriendById(id: string) {
  users = users.map((u: any) => (u.id === id ? { ...u, isFriend: true } : u));
  subs.forEach((s) => s());
}

export function subscribe(fn: Subscriber) {
  subs.push(fn);
  return () => {
    const idx = subs.indexOf(fn);
    if (idx >= 0) subs.splice(idx, 1);
  };
}

export default { getUsers, setUsers, addFriendById, subscribe };
