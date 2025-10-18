import { UserService } from '../../services/User/UserService'

interface DeleteUserData {
    dependencies: { userService: UserService},
    payload: { data: {id: string}}
}

export async function deleteUser({dependencies, payload}: DeleteUserData) {
    const { userService } = dependencies;
    const { id } = payload.data;

    const exists = userService.getById(id);
    if (!id || !exists) throw new Error('Invalid User id');

    return userService.delete(id);
}