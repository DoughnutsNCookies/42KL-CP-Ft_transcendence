export class GameResponseDTO {
	type: 'success' | 'error';
	message: string;

	constructor(type: 'success' | 'error', message: string) {
		this.type = type;
		this.message = message;
	}
}