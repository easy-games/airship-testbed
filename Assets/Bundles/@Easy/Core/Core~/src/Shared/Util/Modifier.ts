interface Ticket<T> {
	value: T;
}

type TicketObserver<T> = (values: T[]) => void;

export class Modifier<T extends defined> {
	/** Set of active tickets */
	private tickets = new Set<Ticket<T>>();
	/** List of callbacks observing changes to this modifier */
	private ticketObservers = new Set<TicketObserver<T>>();

	/**
	 * Add a ticket to the modifier list
	 *
	 * @returns Function to remove this modifier ticket
	 */
	public Add(value: T): () => void {
		const ticket = { value };
		this.tickets.add(ticket);
		this.TriggerObservers();
		return () => {
			const deleted = this.tickets.delete(ticket);
			if (deleted) {
				this.TriggerObservers();
			}
		};
	}

	/** Observe all values within this modifier. Callback fires on ticket add/remove */
	public Observe(observer: (values: T[]) => void): () => void {
		this.ticketObservers.add(observer);
		observer(this.GetTickets());
		return () => {
			this.ticketObservers.delete(observer);
		};
	}

	public GetTickets() {
		const valueList: T[] = [];
		this.tickets.forEach((t) => valueList.push(t.value));
		return valueList;
	}

	/** Trigger all observers when we make a change to the tickets */
	private TriggerObservers() {
		const valueList = this.GetTickets();
		for (const observer of this.ticketObservers) {
			task.spawn(() => {
				observer(valueList);
			});
		}
	}
}
