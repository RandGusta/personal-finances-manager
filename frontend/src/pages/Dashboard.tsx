import ExpensesChart from "../components/ExpensesChart";
import BaseNavBar from "../components/NavBar";
import RecentTransaction from "../components/RecentTransactions";
import UserSummary from "../components/UserSummary";
import { DashboardLayout } from "../layouts/DashboardLayout";

const Dashboard = () => {
return(<>
<BaseNavBar></BaseNavBar>
<DashboardLayout
    userSummary={<UserSummary/>}
    expensesChart={<ExpensesChart/>}
    recentTransactions={<RecentTransaction/>}
/>
</>);
}

export default Dashboard;