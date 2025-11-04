import starIcon from '../../assets/PasswordIcons/star.png';
import appleIcon from '../../assets/PasswordIcons/apple.png';
import carIcon from '../../assets/PasswordIcons/car.png';
import dogIcon from '../../assets/PasswordIcons/dog.png';
import houseIcon from '../../assets/PasswordIcons/house.png';
import bookIcon from '../../assets/PasswordIcons/book.png';
import ballIcon from '../../assets/PasswordIcons/ball.png';
import treeIcon from '../../assets/PasswordIcons/tree.png';
import paintIcon from '../../assets/PasswordIcons/paint.png';
import musicIcon from '../../assets/PasswordIcons/music.png';
import unknownIcon from '../../assets/PasswordIcons/unknown.png';

const iconList = {
  star: { name: 'Star', icon: starIcon , slug : 'sT4r_'},
  apple: { name: 'Apple', icon: appleIcon , slug : '4pp/3-' },
  car: { name: 'Car', icon: carIcon , slug : 'c4r,' },
  dog: { name: 'Dog', icon: dogIcon , slug : 'd0g_' },
  house: { name: 'House', icon: houseIcon , slug : 'h0us3.' },
  book: { name: 'Book', icon: bookIcon , slug : 'b00K_' },
  ball: { name: 'Ball', icon: ballIcon , slug : 'b4L(_' },
  tree: { name: 'Tree', icon: treeIcon , slug : 'tR33_' },
  paint: { name: 'Paint', icon: paintIcon , slug : 'p41Nt_' },
  music: { name: 'Music', icon: musicIcon , slug : 'Mu51c_' },
  unknown: { name: 'Unknown', icon: unknownIcon , slug : 'unkn0wn_' },
};

const iconsMap = Object.values(iconList).map(item => { return { name: item.name, icon: item.icon }; });

export default iconList;
export { iconsMap };