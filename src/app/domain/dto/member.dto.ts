import { BaseDTO } from "../common/base.dto";
import { EntityVirtusDTO } from "./entity-virtus.dto";
import { UserDTO } from "./user.dto";

export class MemberDTO extends BaseDTO {

    user: UserDTO | undefined | null;
    startsAt: Date | undefined | null;
    endsAt: Date | undefined | null;

}