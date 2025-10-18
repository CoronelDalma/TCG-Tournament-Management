import { UserService } from '../../services/User/UserService'
import { User } from '../../entities/User'

type UpdateData = Partial<User>;

interface UpdateUserData {
    dependencies: { userService: UserService},
    payload: { data: UpdateData}
}
export async function updateUser({dependencies, payload}: UpdateUserData) {
    const { userService } = dependencies;
    const { id } = payload.data;

    if (!id) throw new Error('Invalid User id');
    
    return userService.update(id, payload.data);
}