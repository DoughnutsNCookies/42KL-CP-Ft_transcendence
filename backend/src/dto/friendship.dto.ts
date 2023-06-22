import { ApiProperty } from "@nestjs/swagger";
import { UserDTO } from "./user.dto";

export class FriendshipDTO {
	constructor(sender: UserDTO, receiver: UserDTO, status: string) {
		this.sender = sender;
		this.receiver = receiver;
		this.status = status;
	}

	@ApiProperty({ example: UserDTO })
	sender: UserDTO;

	@ApiProperty({ example: UserDTO})
	receiver: UserDTO;

	@ApiProperty({ example: "PENDING | ACCEPTED | BLOCKED" })
	status: string;

	@ApiProperty({ example: 42})
	id: number;
}

export class PostFriendshipBodyDTO {
	@ApiProperty({ example: "schuah" })
	receiverIntraName: string;

	@ApiProperty({ example: "PENDING | ACCEPTED | BLOCKED" })
	status: string;
}