import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import 'dotenv/config';
import mongoose from 'mongoose';
import { Profile, Swipe } from './models.js';

// [name, age, gender, city/college]
const people = [
  ['Aarav', 24, 'men', 'Delhi'],
  ['Ananya', 22, 'women', 'IIT Delhi'],
  ['Kabir', 25, 'men', 'Mumbai'],
  ['Diya', 21, 'women', 'Christ University, Bengaluru'],
  ['Vihaan', 23, 'men', 'BITS Pilani'],
  ['Ishita', 24, 'women', 'Pune'],
  ['Arjun', 26, 'men', 'Hyderabad'],
  ['Meera', 22, 'women', 'Chandigarh'],
  ['Rohan', 25, 'men', 'Gurugram'],
  ['Saanvi', 23, 'women', 'Delhi University'],
  ['Aditya', 24, 'men', 'Bengaluru'],
  ['Kiara', 21, 'women', 'Mumbai'],
  ['Dev', 27, 'men', 'Jaipur'],
  ['Tara', 25, 'women', 'Kolkata'],
  ['Yash', 22, 'men', 'NIT Kurukshetra'],
  ['Riya', 24, 'women', 'Noida'],
  ['Neil', 26, 'men', 'Chennai'],
  ['Aisha', 23, 'women', 'Hyderabad'],
  ['Kunal', 25, 'men', 'Panipat'],
  ['Naina', 22, 'women', 'Chandigarh University'],
  ['Sameer', 24, 'men', 'Pune'],
  ['Pooja', 26, 'women', 'Ahmedabad'],
  ['Ishaan', 23, 'men', 'IIIT Hyderabad'],
  ['Zoya', 25, 'women', 'Lucknow'],
  ['Harsh', 22, 'men', 'Delhi'],
  ['Mahi', 24, 'women', 'Bengaluru'],
  ['Veer', 27, 'men', 'Goa'],
  ['Simran', 21, 'women', 'Amritsar'],
  ['Tanmay', 25, 'men', 'Indore'],
  ['Alia', 23, 'women', 'Mumbai'],
];

const bios = [
  'Chai first, opinions later.',
  'Always up for a good conversation.',
  'Gardener by day, dreamer by night.',
  'Will trade my playlist for your best street food spot.',
  'Gym at 6am, memes at 6:05am.',
  'Looking for someone to explore hidden cafes with.',
  'Introvert with a very loud laugh.',
  'Weekend trekker, weekday overthinker.',
  'I make a mean maggi and an even better playlist.',
  'Bookstore regular. Dog person. Sunset chaser.',
  'Ask me about my last trip, you have been warned.',
  'Part-time coder, full-time foodie.',
];

const interestPool = [
  'Music', 'Travel', 'Cricket', 'Coding', 'Photography', 'Gym', 'Movies', 'Reading', 'Yoga', 'Hiking', 'Swimming', 'Cycling',
  'Cooking', 'Trekking', 'Gaming', 'Dancing', 'Coffee', 'Art', 'Football', 'Podcasts', 'Gardening', 'Meditation', 'Singing', 'Volunteering', 'Fashion', 'Theater', 'Writing', 'Baking', 'Skating', 'Board Games',
];

const pickInterests = (i) =>
  [0, 3, 7, 11].map((step) => interestPool[(i * 2 + step) % interestPool.length]).filter((v, idx, a) => a.indexOf(v) === idx);

const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const docs = people.map(([name, age, gender, city], i) => ({
  name,
  age,
  city,
  photo: `https://randomuser.me/api/portraits/${gender}/${(i * 3 + 7) % 90}.jpg`,
  bio: bios[i % bios.length],
  interests: pickInterests(i),
  likedMe: i % 3 === 0, // 10 of the 30 profiles already liked the logged-in user
}));

await mongoose.connect(process.env.MONGODB_URI);
await Promise.all([Profile.deleteMany({}), Swipe.deleteMany({})]);
await Profile.insertMany(shuffle(docs)); // shuffled so the likers are spread through the feed
// console.log(`Seeded ${docs.length} profiles (${docs.filter((d) => d.likedMe).length} already like you)`);
await mongoose.disconnect();
