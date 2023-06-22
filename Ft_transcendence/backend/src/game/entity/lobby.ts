import { Player } from "./player";

export class Lobby {
	public name: string;
	public host: string;
	public player1: Player;
	public player2: Player | null;
	public gameType: string;
	public player1Ready: boolean;
	public player2Ready: boolean;
	public player1PowerUp: string;
	public player2PowerUp: string;

	constructor (player1: Player, player2: Player, gameType: string) {
		this.name = player1.intraName + player2.intraName;
		this.host = player1.intraName;
		this.player1 = player1;
		this.player2 = player2;
		this.gameType = gameType;
	}
}