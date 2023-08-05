export class UpdateUserDto {
	username: string;
	discriminator?: string;

	constructor(username: string, discriminator?: string) {
		this.username = username;
		this.discriminator = discriminator;
	}
}
