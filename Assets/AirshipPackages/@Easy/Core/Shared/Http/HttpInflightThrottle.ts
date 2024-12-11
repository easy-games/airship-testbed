export interface KeyType {
    shouldRemove(createdAt: number, additionalWaitTime: number): boolean;
}

export class InflightTask<K extends KeyType, T> {
    public readonly createdAt: number;

    constructor(
        public readonly key: K,
        public readonly resolve: (value: T | Promise<T>) => void,
        public readonly reject: (error: unknown) => void
    ) {
        this.createdAt = os.time();
    }

    public shouldRemove(additionalWaitTime: number): boolean {
        return this.key.shouldRemove(this.createdAt, additionalWaitTime);
    }
}

export type RequestExecutor<K extends KeyType, T> = (task: InflightTask<K, T>) => void;

export class HttpInflightThrottleExecutor<K extends KeyType, T> {
    private readonly queue: Array<InflightTask<K, T>> = [];

    constructor(private availableSize: number, private readonly requestExecutor: RequestExecutor<K, T>) {
        task.spawnDetached(() => {
          while (task.unscaledWait(1)) {
            this.removeWaiting();
          }
        });
    }

    public removeWaiting(additionalWaitTime: number = 0, limit: number = 10) {
        const toRemove = [];
        // gather all tasks that should be removed
        for (let i = 0; i < this.queue.size() && (limit < 0 || limit < toRemove.size()); i++) {
            const task = this.queue[i];
            if (task.shouldRemove(additionalWaitTime)) { 
                toRemove.push(i);
            }
        }
        // actually remove the tasks from the queue
        let removed = 0;
        for (let i = 0; i < toRemove.size(); i++) {
            const removedTask = this.queue.remove(toRemove[i] - removed);
            if (removedTask === undefined) {
                return;
            } 
            removedTask.reject("Http request cancelled while waiting.");
            removed++;
        }
    }

    public run(key: K): Promise<T> {
        return new Promise((resolve, reject) => {
            const task = new InflightTask(key, resolve, reject);
            this.runTask(task);
        });
    }

    public runTask(inflightTask: InflightTask<K, T>) {
        if (this.tryAcquire()) {
            task.spawnDetached(() => {
                this.execute(inflightTask);
            });
        } else {
            this.queue.push(inflightTask);
        }
    }

    private execute(task: InflightTask<K, T>) {
        try {
            return this.requestExecutor(task);
        } finally {
            const nextExecutor = this.queue.shift();
            if (nextExecutor !== undefined) {
                this.execute(nextExecutor);
            } else {
                this.release();
            }
        }
    }

    // releases an available "inflight" slot
    private release() {
        this.availableSize++;
    }

    // attempts to acquire an available "inflight" slot, returning true if it can run immediately
    private tryAcquire(): boolean {
        if (this.availableSize === 0) {
            return false;
        }
        this.availableSize--;
        return true;
    }
}

export function HttpInflightThrottle<K extends KeyType, T>(
    limit: number, requestExecutor: RequestExecutor<K, T>
) {
    return new HttpInflightThrottleExecutor(limit, requestExecutor);
}
