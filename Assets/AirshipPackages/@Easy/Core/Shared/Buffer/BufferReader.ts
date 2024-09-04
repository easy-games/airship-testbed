export class BufferReader {
	private buffer: buffer;
	private cursor = 0;
	private size: number;

	public constructor(b: string | buffer) {
		this.buffer = typeIs(b, "string") ? buffer.fromstring(b) : b;
		this.size = buffer.len(this.buffer);
	}

	public GetSize() {
		return this.size;
	}

	public GetBuffer() {
		return this.buffer;
	}

	public ReadInt8() {
		const n = buffer.readi8(this.buffer, this.cursor);
		this.cursor += 1;
		return n;
	}

	public ReadUInt8() {
		const n = buffer.readu8(this.buffer, this.cursor);
		this.cursor += 1;
		return n;
	}

	public ReadInt16() {
		const n = buffer.readi16(this.buffer, this.cursor);
		this.cursor += 2;
		return n;
	}

	public ReadUInt16() {
		const n = buffer.readu16(this.buffer, this.cursor);
		this.cursor += 2;
		return n;
	}

	public ReadInt32() {
		const n = buffer.readi32(this.buffer, this.cursor);
		this.cursor += 4;
		return n;
	}

	public ReadUInt32() {
		const n = buffer.readu32(this.buffer, this.cursor);
		this.cursor += 4;
		return n;
	}

	public ReadFloat32() {
		const n = buffer.readf32(this.buffer, this.cursor);
		this.cursor += 4;
		return n;
	}

	public ReadFloat64() {
		const n = buffer.readf64(this.buffer, this.cursor);
		this.cursor += 8;
		return n;
	}

	public ReadString() {
		const strLen = this.ReadUInt32();
		const s = buffer.readstring(this.buffer, this.cursor, strLen);
		this.cursor += strLen;
		return s;
	}

	public ReadBoolean() {
		return this.ReadUInt8() !== 0;
	}
}
