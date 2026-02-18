const TaskCard = ({ task, onAccept, onCancel }) => {
  return (
    <div className="task-card">
      <p><b>Order:</b> {task.orderId}</p>
      <p><b>Customer:</b> {task.customerName}</p>
      <p><b>Address:</b> {task.address}</p>

      {task.status === "Pending" && (
        <div>
          <button onClick={() => onAccept(task._id)}>Accept</button>
          <button onClick={() => onCancel(task._id)}>Cancel</button>
        </div>
      )}

      <p>Status: {task.status}</p>
    </div>
  );
};

export default TaskCard;
