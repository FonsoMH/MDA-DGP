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
  star: { name: 'Star', icon: starIcon },
  apple: { name: 'Apple', icon: appleIcon },
  car: { name: 'Car', icon: carIcon },
  dog: { name: 'Dog', icon: dogIcon },
  house: { name: 'House', icon: houseIcon },
  book: { name: 'Book', icon: bookIcon },
  ball: { name: 'Ball', icon: ballIcon },
  tree: { name: 'Tree', icon: treeIcon },
  paint: { name: 'Paint', icon: paintIcon },
  music: { name: 'Music', icon: musicIcon },
  unknown: { name: 'Unknown', icon: unknownIcon },
};

const iconsMap = Object.values(iconList).map(item => { return { name: item.name, icon: item.icon }; });

export default iconList;
export { iconsMap };