import Image from "next/image";
import MenuLink from "./menu/menuLink";
import styles from "./sidebar.module.css";
import {
  MdDashboard,
  MdSupervisedUserCircle,
  MdShoppingBag,
  MdAttachMoney,
  MdWork,
  MdAnalytics,
  MdPeople,
  MdOutlineSettings,
  MdHelpCenter,
  MdLogout,
  MdLocalOffer,
  
} from "react-icons/md";
import { RiListOrdered } from "react-icons/ri";
import { IoFastFoodOutline } from "react-icons/io5";
import { BiCategoryAlt } from "react-icons/bi";
import { MdTableRestaurant } from "react-icons/md";
import { LuSquareActivity } from "react-icons/lu";
import { Style } from "@mui/icons-material";
import { FaTablet } from "react-icons/fa6";


const menuItems = [
  {
    title: "Management",
    list: [
      {
        title: "Dashboard",
        path: "/admin/dashboard",
        icon: <MdDashboard />,
      },
      {
        title: "Users",
        path: "/admin/dashboard/users",
        icon: <MdSupervisedUserCircle />,
      },
      {
        title: "Category",
        path: "/admin/dashboard/category",
        icon: <BiCategoryAlt />,
      },
      {
        title: "Foods Management",
        path: "/admin/dashboard/products",
        icon: <IoFastFoodOutline />,
      },
      {
        title: "Discounts",
        path: "/admin/dashboard/discount",
        icon: <MdLocalOffer />,
      },
      {
        title: "Table",
        path: "/admin/dashboard/table",
        icon: <MdTableRestaurant />,
      },
      {
        title: "Order",
        path: "/admin/dashboard/order",
        icon: <FaTablet />,
      },
      {
        title: "Order Table",
        path: "/admin/dashboard/orderTable",
        icon: <RiListOrdered />,
      },
    ],
  },
  {
    title: "User",
    list: [
      {
        title: "Config",
        path: "/admin/dashboard/config",
        icon: <MdOutlineSettings />,
      },
      {
        title: "Log Activity",
        path: "/admin/dashboard/log",
        icon: <LuSquareActivity/>
      }
    ],
  },
];

const Sidebar = async () => {
  return (
    <div className={styles.container}>
      <ul >
        {menuItems.map((cat) => (
          <li key={cat.title}>
            <span className={styles.cat}>
              {cat.title}
            </span>
            {cat.list.map((item) => (
              <MenuLink key={item.title} item={item}>
                {/* {item.title} */}
              </MenuLink>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;