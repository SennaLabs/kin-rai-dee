// data.jsx — mock content (Thai restaurants + players)

const RESTAURANTS = [
  { id: 'r1', name: 'ส้มตำแซ่บนัว', cuisine: 'อีสาน', rating: 4.7, reviews: 1284,
    price: 1, dist: 0.4, open: true, hours: '10:00–21:00',
    addr: 'ซอยอารีย์ 4 พญาไท', phone: '02-114-2200',
    tags: ['อีสาน','เผ็ด','ทานเล่น'], emoji: '🥗',
    g: ['#FF7A5E', '#E63946'] },
  { id: 'r2', name: 'ก๋วยเตี๋ยวเรือ ป้าศรี', cuisine: 'ก๋วยเตี๋ยว', rating: 4.5, reviews: 932,
    price: 1, dist: 0.8, open: true, hours: '08:00–16:00',
    addr: 'ตลาดน้ำ คลองลัดมะยม', phone: '02-441-9087',
    tags: ['เส้น','น้ำตก','ของกินเล่น'], emoji: '🍜',
    g: ['#FFB627', '#FF5A3C'] },
  { id: 'r3', name: 'ชาบูเฮ้าส์ ไม่อั้น', cuisine: 'ชาบู/หม้อไฟ', rating: 4.6, reviews: 2051,
    price: 3, dist: 1.2, open: true, hours: '11:00–23:00',
    addr: 'เอกมัย ซอย 12', phone: '02-714-5566',
    tags: ['บุฟเฟต์','กลุ่ม','หม้อไฟ'], emoji: '🍲',
    g: ['#FF5A3C', '#D7263D'] },
  { id: 'r4', name: 'ข้าวมันไก่ประตูน้ำ', cuisine: 'ตามสั่ง', rating: 4.4, reviews: 768,
    price: 1, dist: 0.6, open: true, hours: '06:00–14:00',
    addr: 'ประตูน้ำ ราชเทวี', phone: '02-251-7788',
    tags: ['จานเดียว','ไก่','รวดเร็ว'], emoji: '🍗',
    g: ['#FFC845', '#FF7A5E'] },
  { id: 'r5', name: 'พิซซ่าเตาฟืน Forno', cuisine: 'อิตาเลียน', rating: 4.8, reviews: 1567,
    price: 3, dist: 2.1, open: true, hours: '11:30–22:30',
    addr: 'ทองหล่อ ซอย 10', phone: '02-185-3344',
    tags: ['อิตาเลียน','เตาฟืน','แชร์'], emoji: '🍕',
    g: ['#FF7A5E', '#FFB627'] },
  { id: 'r6', name: 'หมูกระทะ ลุงหนวด', cuisine: 'ปิ้งย่าง', rating: 4.3, reviews: 1129,
    price: 2, dist: 1.6, open: true, hours: '16:00–24:00',
    addr: 'รัชดา ซอย 7', phone: '02-690-1212',
    tags: ['ปิ้งย่าง','กลุ่ม','ดึก'], emoji: '🍖',
    g: ['#E63946', '#FF4D2E'] },
  { id: 'r7', name: 'ราเมงต้นตำรับ Koji', cuisine: 'ญี่ปุ่น', rating: 4.7, reviews: 1893,
    price: 2, dist: 1.9, open: false, hours: '17:00–23:00',
    addr: 'พร้อมพงษ์ สุขุมวิท 39', phone: '02-260-9090',
    tags: ['ญี่ปุ่น','เส้น','ทงคตสึ'], emoji: '🍥',
    g: ['#FFB627', '#FF5A3C'] },
  { id: 'r8', name: 'ตำมั่ว สาขาริมคลอง', cuisine: 'อีสาน', rating: 4.2, reviews: 540,
    price: 2, dist: 2.4, open: true, hours: '10:30–21:30',
    addr: 'เลียบคลองภาษีเจริญ', phone: '02-457-2323',
    tags: ['อีสาน','ปลาเผา','บรรยากาศ'], emoji: '🐟',
    g: ['#FF5A3C', '#FFC845'] },
  { id: 'r9', name: 'ข้าวซอยเชียงดาว', cuisine: 'เหนือ', rating: 4.6, reviews: 845,
    price: 2, dist: 1.4, open: true, hours: '09:00–20:00',
    addr: 'อารีย์ ซอย 1', phone: '02-279-6655',
    tags: ['อาหารเหนือ','ข้าวซอย','แกง'], emoji: '🍛',
    g: ['#FFC845', '#FF4D2E'] },
  { id: 'r10', name: 'บิงซู & คาเฟ่ ละมุน', cuisine: 'ของหวาน/คาเฟ่', rating: 4.5, reviews: 1320,
    price: 2, dist: 0.9, open: true, hours: '11:00–22:00',
    addr: 'สะพานควาย ประดิพัทธ์', phone: '02-271-4848',
    tags: ['ของหวาน','คาเฟ่','นั่งชิล'], emoji: '🍧',
    g: ['#FF7A5E', '#FFB627'] },
  { id: 'r11', name: 'เป็ดย่างเตาถ่าน ตี๋ใหญ่', cuisine: 'จีน', rating: 4.4, reviews: 670,
    price: 2, dist: 2.7, open: true, hours: '10:00–20:00',
    addr: 'เยาวราช ซอย 9', phone: '02-222-1717',
    tags: ['จีน','เป็ดย่าง','ข้าวหน้า'], emoji: '🦆',
    g: ['#E63946', '#FFB627'] },
  { id: 'r12', name: 'ไก่ทอดหาดใหญ่ พี่นุช', cuisine: 'ใต้', rating: 4.6, reviews: 988,
    price: 1, dist: 1.1, open: true, hours: '09:30–19:00',
    addr: 'บางรัก สีลม', phone: '02-233-5959',
    tags: ['อาหารใต้','ไก่ทอด','ข้าวเหนียว'], emoji: '🍤',
    g: ['#FFB627', '#FF7A5E'] },
];

// players in the room (current user = me)
const PLAYERS = [
  { id: 'p_me', name: 'คุณ',   emoji: '🦊', host: true,  me: true,  ready: false },
  { id: 'p2',   name: 'ฟ้า',   emoji: '🐰', host: false, me: false, ready: false },
  { id: 'p3',   name: 'บาส',   emoji: '🐻', host: false, me: false, ready: false },
  { id: 'p4',   name: 'มิ้น',  emoji: '🐱', host: false, me: false, ready: false },
];

// price → ฿ string
function priceStr(n) { return '฿'.repeat(n); }

// cuisine chips used in Create Room
const CUISINES = ['อีสาน','ตามสั่ง','ญี่ปุ่น','ก๋วยเตี๋ยว','ปิ้งย่าง','ชาบู','อิตาเลียน','คาเฟ่','อาหารเหนือ','อาหารใต้','จีน','ของหวาน'];

const AVATAR_CHOICES = ['🦊','🐰','🐻','🐱','🐼','🐧','🐯','🦄','🍕','🍜','🌮','🍙'];

Object.assign(window, { RESTAURANTS, PLAYERS, priceStr, CUISINES, AVATAR_CHOICES });
