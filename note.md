- কিভাবে Next.js 13 এ কোনো plugins ছাড়া ফাইল আপলোড করা যায়, সেই সাথে ফাইলটি যদি ইমেজ হয় তাহলে অটোমেটিক রিসাইজ হয়ে আপলোড হবে। 


- ধাপ: 
    ফাইল সিলেক্ট করে আপলোড বাটনে ক্লিক করলে ফাইল এর extension নিতে হবে। এর জন্য একটি কাস্টম ফাংশন তৈরি করেছি।
```js
const getExtension = (name) => {
return name.split(".").pop();
};
```
- তারপর extension ইমেজ এর extension এর সাথে মিললে imageResizer() function call করা হয়েছে। এটি parameter হিসেবে সিলেক্টেড ইমেজ ফাইল আর রিসাইজ অপশন নেয়। রিসাইজ অপশন এর ভ্যালু 0 থেকে 1 এর মধ্যে। ভ্যালু 0.5 এর মানে হচ্ছে অরিজিনাল ইমেজ ফাইল এর সাইজ 50% কমাতে হবে।
```js
const resized = await imageResizer(selected, 0.6); //0.6 means reduce image size 60%, use any value between 0-1
```
- যারা javascript এর asynchronous behavior সম্পর্কে জানেন না তারা সুমিত ভাই এর ইউটিউব চ্যানেলে এ সম্পর্কে বিস্তারিত আলোচনা পাবেন।
imageResizer() function রিসাইজ করা ইমেজের base64 data, size, width, height ইত্যাদি রিটার্ন করে। asynchronous এর জন্য কয়েক জায়গায় প্রমিস ব্যবহার করেছি।
ইমেজ ফাইল এর জন্য FormData() তে একরকম আর অন্য ফাইল এর জন্য আলাদাভাবে file data আর fileName append  করেছি যাতে backend এ সব রকমের ফাইল হ্যান্ডেল করতে সুবিধা হয়।
``` js
const formData = new FormData();
//check file extension. If it is image, resize it
if (["jpg", "png", "gif", "webp"].includes(getExtension(selected.name))) {
const resized = await imageResizer(selected, 0.6); //0.6 means reduce image size 60%, use any value between 0-1
alert(JSON.stringify(resized));
formData.append("file", resized.resizedData);
formData.append("fileName", selected.name);
const imageData = {
name: selected.name,
type: selected.type,
data: resized.resizedData,
};
alert("imageData: " + JSON.stringify(imageData));
setSelected(imageData);
} else {
formData.append("file", selected);
formData.append("fileName", selected.name);
}
```
- এরর হ্যান্ডেলিং এর জন্য বিভিন্ন জায়গায় অ্যালার্ট/কনসোল লগ ব্যবহার করা হয়েছে।
Backend এ ফাইল ডাটা আর ফাইলনেম নিয়ে প্রথমে এক্সটেনশন চেক করতে হবে। এক্সটেনশন যদি ইমেজ এর সাথে মিলে যায় তাহলে একভাবে আর অন্য টাইপ এর ফাইল হলে অন্যভাবে সেভ করা হয়েছে। এর কারন হচ্ছে ইমেজ ডাটা base64 format এ আছে। এই ফরমেট এর ডাটা সেভ করার আগে base64 string এর প্রথমে data: থেকে ;base64, অংশ বাদ দিতে হবে। কারণ এটা মূল ইমেজ ফাইল এর অংশ না, এটা মূল ইমেজ ফাইলকে ক্যানভাস এর মাধ্যমে বাইনারি থেকে ASCII ফরমেট এ রূপান্তরের সময় যুক্ত হয়েছে।
এখানে ফাইল সার্ভারে সেভ করার জন্য nodejs এর fs module ব্যবহার করা হয়েছে। সেভ করার আগে অবশ্যই ডাটাকে binary data তে কনভার্ট করতে হবে। এর জন্য nodejs এ Buffer.from() function আছে। 
সেভ করার আগে কি নামে ফাইল সেভ করবেন সে ক্ষেত্রে কিছু লক্ষণীয় বিষয় আছে। যেমন: ইউজার যে ফাইল আপলোড করবে তার নাম এর মধ্যে স্পেস বা কোনো স্পেশাল ক্যারেক্টার থাকতে পারে। সেক্ষেত্রে ফাইল সেভ করার সময় এরর দেখাবে। এর জন্য রেগুলার এক্সপ্রেশন ব্যবহার করে ফাইলনেম স্যনিটাইজ করা যেতে পারে। কিন্ত এক্ষেত্রেও একটি ঝামেলা আছে, তা হল বিভিন্ন সময় একই নামের অনেকগুলো ফাইল আপলোড হতে পারে সেক্ষেত্রে ফাইলগুলোকে ট্র্যাক করতে সমস্যা হবে। একাধিক ইউজার এর ডাটাবেস এ একই নামে ফাইল থাকলে সেটা তো অবশ্যই সমস্যা। যেমন দুইজনের প্রোপাইল পিকচার এর নাম একই হলে একজনের প্রোপাইল পিকচারের জায়গায় অন্যজনের প্রোপাইল পিকচার চলে আসতে পারে। তাই এত ঝামেলায় না গিয়ে নিজস্ব প্যাটার্নে ফাইল এর নাম দেওয়া যেতে পারে। যেমন এখানে আমি প্রথমে  'MHS_" prefix, তারপর Date.now() function যা সবসময় বর্তমান ডেট নাম্বার আকারে দিবে এবং এটি সবসময় ইউনিক। সবশেষে অরিজিনাল ফাইলনেম থেকে এক্সটেনশন এনে নাম এর শেষে বসিয়ে দিলেই কাজ শেষ। সবসময় ইউনিক নাম থাকার কারনে ফাইল ট্র্যাক করতে আর অসুবিধা হবে না।

> coded by : Mehedi Hasan Shuvo