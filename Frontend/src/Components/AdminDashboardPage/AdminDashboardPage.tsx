import "./AdminDashboardPage.css";
import AdminSummaryCard from "../../Components/AdminSummaryCard/AdminSummaryCard";

function AdminDashboardPage(): JSX.Element {
    return (
        <div className="admin-dashboard">
            <div className="admin-dashboard-header">
                <div>
                    <h1>מסך ניהול ראשי</h1>
                    <p>כאן תוכל לנהל את המלאי, הדיווחים והיחידות במערכת.</p>
                </div>
            </div>

            <section className="admin-summary-grid">
                <AdminSummaryCard
                    title="סה״כ מכשירים"
                    value={248}
                    subtitle="כלל המכשירים במערכת"
                />

                <AdminSummaryCard
                    title="דווחו היום"
                    value={173}
                    subtitle="מכשירים שסומנו כדווחו"
                />

                <AdminSummaryCard
                    title="לא דווחו היום"
                    value={75}
                    subtitle="מכשירים שדורשים מעקב"
                />

                <AdminSummaryCard
                    title="משתמשים"
                    value={96}
                    subtitle="סה״כ משתמשים רשומים"
                />
            </section>

            <section className="admin-sections-grid">
                <div className="admin-panel">
                    <h2>פעולות מהירות</h2>

                    <div className="admin-actions">
                        <button type="button">פתיחת גיליון מלאי חדש</button>
                        <button type="button">יצירת דיווח יומי</button>
                        <button type="button">צפייה בכל המכשירים</button>
                        <button type="button">מעקב אחרי לא דווח</button>
                    </div>
                </div>

                <div className="admin-panel">
                    <h2>סטטוס מערכת</h2>
                    <ul className="admin-status-list">
                        <li>יש 3 יחידות עם חוסרי דיווח גבוהים</li>
                        <li>נוצר גיליון יומי להיום</li>
                        <li>קיימים 12 מכשירים במחסן</li>
                    </ul>
                </div>
            </section>

            <section className="admin-panel">
                <h2>מכשירים שלא דווחו היום</h2>

                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>מספר מכשיר</th>
                                <th>משתמש משויך</th>
                                <th>יחידה</th>
                                <th>אחראי יחידה</th>
                                <th>סטטוס</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>100234</td>
                                <td>ישראל ישראלי</td>
                                <td>יחידה א</td>
                                <td>דניאל כהן</td>
                                <td>לא דווח</td>
                            </tr>
                            <tr>
                                <td>100235</td>
                                <td>איתי לוי</td>
                                <td>יחידה ב</td>
                                <td>רועי אברהם</td>
                                <td>לא דווח</td>
                            </tr>
                            <tr>
                                <td>100236</td>
                                <td>נועם פרץ</td>
                                <td>מחסן</td>
                                <td>מנהל מערכת</td>
                                <td>לא דווח</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

export default AdminDashboardPage;