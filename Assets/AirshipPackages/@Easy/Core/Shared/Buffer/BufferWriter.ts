export class BufferWriter {
	private buffer: buffer;
	private cursor = 0;
	private size = 0;

	public constructor(initialSize: number) {
		this.buffer = buffer.create(initialSize);
	}

	private ResizeTo(size: number) {
		this.size = math.max(this.size, size);

		if (size < buffer.len(this.buffer)) {
			return;
		}

		const powerOfTwo = math.log(size, 2);
		if (math.floor(powerOfTwo) !== powerOfTwo) {
			size = 2 ** (math.floor(powerOfTwo) + 1);
		}

		const oldBuffer = this.buffer;
		const newBuffer = buffer.create(size);

		buffer.copy(newBuffer, 0, oldBuffer, 0);
		this.buffer = newBuffer;
	}

	public GetSize() {
		return this.size;
	}

	public GetBuffer() {
		return this.buffer;
	}

	public GetBufferAsString() {
		return buffer.tostring(this.buffer);
	}

	WriteInt8(i8: number) {
		this.ResizeTo(this.cursor + 1);
		buffer.writei8(this.buffer, this.cursor, i8);
		this.cursor += 1;
		return this;
	}

	WriteUInt8(u8: number) {
		this.ResizeTo(this.cursor + 1);
		buffer.writeu8(this.buffer, this.cursor, u8);
		this.cursor += 1;
		return this;
	}

	WriteInt16(i16: number) {
		this.ResizeTo(this.cursor + 2);
		buffer.writei16(this.buffer, this.cursor, i16);
		this.cursor += 2;
		return this;
	}

	WriteUInt16(u16: number) {
		this.ResizeTo(this.cursor + 2);
		buffer.writeu16(this.buffer, this.cursor, u16);
		this.cursor += 2;
		return this;
	}

	WriteInt32(i32: number) {
		this.ResizeTo(this.cursor + 4);
		buffer.writei32(this.buffer, this.cursor, i32);
		this.cursor += 4;
		return this;
	}

	WriteUInt32(u32: number) {
		this.ResizeTo(this.cursor + 4);
		buffer.writeu32(this.buffer, this.cursor, u32);
		this.cursor += 4;
		return this;
	}

	WriteFloat32(f32: number) {
		this.ResizeTo(this.cursor + 4);
		buffer.writef32(this.buffer, this.cursor, f32);
		this.cursor += 4;
		return this;
	}

	WriteFloat64(f64: number) {
		this.ResizeTo(this.cursor + 8);
		buffer.writef64(this.buffer, this.cursor, f64);
		this.cursor += 8;
		return this;
	}

	WriteString(str: string) {
		const len = str.size();
		const size = len + 4;
		this.ResizeTo(this.cursor + size);
		buffer.writeu32(this.buffer, this.cursor, len);
		buffer.writestring(this.buffer, this.cursor + 4, str, len);
		this.cursor += size;
		return this;
	}

	WriteBoolean(bool: boolean) {
		this.WriteUInt8(bool ? 1 : 0);
		return this;
	}
}
