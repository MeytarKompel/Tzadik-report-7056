import "./AdminSummaryCard.css";

interface AdminSummaryCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
}

function AdminSummaryCard(props: AdminSummaryCardProps): JSX.Element {
    return (
        <div className="admin-summary-card">
            <h3>{props.title}</h3>
            <div className="admin-summary-value">{props.value}</div>
            {props.subtitle && (
                <p className="admin-summary-subtitle">{props.subtitle}</p>
            )}
        </div>
    );
}

export default AdminSummaryCard;