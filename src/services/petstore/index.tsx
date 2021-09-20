/* Generated by restful-react */

import React from 'react'
import { Get, GetProps, useGet, UseGetProps, Mutate, MutateProps, useMutate, UseMutateProps } from 'restful-react'

import { getConfig } from '../config'
export const SPEC_VERSION = '1.0.5'
export interface ApiResponse {
  code?: number
  message?: string
  type?: string
}

export interface Category {
  id?: number
  name?: string
}

export interface Order {
  complete?: boolean
  id?: number
  petId?: number
  quantity?: number
  shipDate?: string
  /**
   * Order Status
   */
  status?: 'placed' | 'approved' | 'delivered'
}

export interface Pet {
  category?: Category
  id?: number
  name: string
  photoUrls: string[]
  /**
   * pet status in the store
   */
  status?: 'available' | 'pending' | 'sold'
  tags?: Tag[]
}

export interface Tag {
  id?: number
  name?: string
}

export interface User {
  email?: string
  firstName?: string
  id?: number
  lastName?: string
  password?: string
  phone?: string
  /**
   * User Status
   */
  userStatus?: number
  username?: string
}

/**
 * Pet object that needs to be added to the store
 */
export type PetRequestBody = Pet

/**
 * List of user object
 */
export type UserArrayRequestBody = User[]

export type AddPetProps = Omit<MutateProps<void, void, void, PetRequestBody, void>, 'path' | 'verb'>

/**
 * Add a new pet to the store
 */
export const AddPet = (props: AddPetProps) => (
  <Mutate<void, void, void, PetRequestBody, void> verb="POST" path={`/pet`} base={getConfig('petstore')} {...props} />
)

export type UseAddPetProps = Omit<UseMutateProps<void, void, void, PetRequestBody, void>, 'path' | 'verb'>

/**
 * Add a new pet to the store
 */
export const useAddPet = (props: UseAddPetProps) =>
  useMutate<void, void, void, PetRequestBody, void>('POST', `/pet`, {
    base: getConfig('petstore'),
    ...props
  })

export type UpdatePetProps = Omit<MutateProps<void, void, void, PetRequestBody, void>, 'path' | 'verb'>

/**
 * Update an existing pet
 */
export const UpdatePet = (props: UpdatePetProps) => (
  <Mutate<void, void, void, PetRequestBody, void> verb="PUT" path={`/pet`} base={getConfig('petstore')} {...props} />
)

export type UseUpdatePetProps = Omit<UseMutateProps<void, void, void, PetRequestBody, void>, 'path' | 'verb'>

/**
 * Update an existing pet
 */
export const useUpdatePet = (props: UseUpdatePetProps) =>
  useMutate<void, void, void, PetRequestBody, void>('PUT', `/pet`, {
    base: getConfig('petstore'),
    ...props
  })

export interface FindPetsByStatusQueryParams {
  /**
   * Status values that need to be considered for filter
   */
  status: ('available' | 'pending' | 'sold')[]
}

export type FindPetsByStatusProps = Omit<GetProps<Pet[], void, FindPetsByStatusQueryParams, void>, 'path'>

/**
 * Finds Pets by status
 *
 * Multiple status values can be provided with comma separated strings
 */
export const FindPetsByStatus = (props: FindPetsByStatusProps) => (
  <Get<Pet[], void, FindPetsByStatusQueryParams, void>
    path={`/pet/findByStatus`}
    base={getConfig('petstore')}
    {...props}
  />
)

export type UseFindPetsByStatusProps = Omit<UseGetProps<Pet[], void, FindPetsByStatusQueryParams, void>, 'path'>

/**
 * Finds Pets by status
 *
 * Multiple status values can be provided with comma separated strings
 */
export const useFindPetsByStatus = (props: UseFindPetsByStatusProps) =>
  useGet<Pet[], void, FindPetsByStatusQueryParams, void>(`/pet/findByStatus`, {
    base: getConfig('petstore'),
    ...props
  })

export interface FindPetsByTagsQueryParams {
  /**
   * Tags to filter by
   */
  tags: string[]
}

export type FindPetsByTagsProps = Omit<GetProps<Pet[], void, FindPetsByTagsQueryParams, void>, 'path'>

/**
 * Finds Pets by tags
 *
 * Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.
 */
export const FindPetsByTags = (props: FindPetsByTagsProps) => (
  <Get<Pet[], void, FindPetsByTagsQueryParams, void> path={`/pet/findByTags`} base={getConfig('petstore')} {...props} />
)

export type UseFindPetsByTagsProps = Omit<UseGetProps<Pet[], void, FindPetsByTagsQueryParams, void>, 'path'>

/**
 * Finds Pets by tags
 *
 * Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.
 */
export const useFindPetsByTags = (props: UseFindPetsByTagsProps) =>
  useGet<Pet[], void, FindPetsByTagsQueryParams, void>(`/pet/findByTags`, {
    base: getConfig('petstore'),
    ...props
  })

export type DeletePetProps = Omit<MutateProps<void, void, void, number, void>, 'path' | 'verb'>

/**
 * Deletes a pet
 */
export const DeletePet = (props: DeletePetProps) => (
  <Mutate<void, void, void, number, void> verb="DELETE" path={`/pet`} base={getConfig('petstore')} {...props} />
)

export type UseDeletePetProps = Omit<UseMutateProps<void, void, void, number, void>, 'path' | 'verb'>

/**
 * Deletes a pet
 */
export const useDeletePet = (props: UseDeletePetProps) =>
  useMutate<void, void, void, number, void>('DELETE', `/pet`, {
    base: getConfig('petstore'),
    ...props
  })

export interface GetPetByIdPathParams {
  /**
   * ID of pet to return
   */
  petId: number
}

export type GetPetByIdProps = Omit<GetProps<Pet, void, void, GetPetByIdPathParams>, 'path'> & GetPetByIdPathParams

/**
 * Find pet by ID
 *
 * Returns a single pet
 */
export const GetPetById = ({ petId, ...props }: GetPetByIdProps) => (
  <Get<Pet, void, void, GetPetByIdPathParams> path={`/pet/${petId}`} base={getConfig('petstore')} {...props} />
)

export type UseGetPetByIdProps = Omit<UseGetProps<Pet, void, void, GetPetByIdPathParams>, 'path'> & GetPetByIdPathParams

/**
 * Find pet by ID
 *
 * Returns a single pet
 */
export const useGetPetById = ({ petId, ...props }: UseGetPetByIdProps) =>
  useGet<Pet, void, void, GetPetByIdPathParams>((paramsInPath: GetPetByIdPathParams) => `/pet/${paramsInPath.petId}`, {
    base: getConfig('petstore'),
    pathParams: { petId },
    ...props
  })

export interface UpdatePetWithFormPathParams {
  /**
   * ID of pet that needs to be updated
   */
  petId: number
}

export type UpdatePetWithFormProps = Omit<
  MutateProps<void, void, void, void, UpdatePetWithFormPathParams>,
  'path' | 'verb'
> &
  UpdatePetWithFormPathParams

/**
 * Updates a pet in the store with form data
 */
export const UpdatePetWithForm = ({ petId, ...props }: UpdatePetWithFormProps) => (
  <Mutate<void, void, void, void, UpdatePetWithFormPathParams>
    verb="POST"
    path={`/pet/${petId}`}
    base={getConfig('petstore')}
    {...props}
  />
)

export type UseUpdatePetWithFormProps = Omit<
  UseMutateProps<void, void, void, void, UpdatePetWithFormPathParams>,
  'path' | 'verb'
> &
  UpdatePetWithFormPathParams

/**
 * Updates a pet in the store with form data
 */
export const useUpdatePetWithForm = ({ petId, ...props }: UseUpdatePetWithFormProps) =>
  useMutate<void, void, void, void, UpdatePetWithFormPathParams>(
    'POST',
    (paramsInPath: UpdatePetWithFormPathParams) => `/pet/${paramsInPath.petId}`,
    { base: getConfig('petstore'), pathParams: { petId }, ...props }
  )

export interface UploadFilePathParams {
  /**
   * ID of pet to update
   */
  petId: number
}

export type UploadFileProps = Omit<
  MutateProps<ApiResponse, unknown, void, void, UploadFilePathParams>,
  'path' | 'verb'
> &
  UploadFilePathParams

/**
 * uploads an image
 */
export const UploadFile = ({ petId, ...props }: UploadFileProps) => (
  <Mutate<ApiResponse, unknown, void, void, UploadFilePathParams>
    verb="POST"
    path={`/pet/${petId}/uploadImage`}
    base={getConfig('petstore')}
    {...props}
  />
)

export type UseUploadFileProps = Omit<
  UseMutateProps<ApiResponse, unknown, void, void, UploadFilePathParams>,
  'path' | 'verb'
> &
  UploadFilePathParams

/**
 * uploads an image
 */
export const useUploadFile = ({ petId, ...props }: UseUploadFileProps) =>
  useMutate<ApiResponse, unknown, void, void, UploadFilePathParams>(
    'POST',
    (paramsInPath: UploadFilePathParams) => `/pet/${paramsInPath.petId}/uploadImage`,
    { base: getConfig('petstore'), pathParams: { petId }, ...props }
  )

export interface GetInventoryResponse {
  [key: string]: number
}

export type GetInventoryProps = Omit<GetProps<GetInventoryResponse, unknown, void, void>, 'path'>

/**
 * Returns pet inventories by status
 *
 * Returns a map of status codes to quantities
 */
export const GetInventory = (props: GetInventoryProps) => (
  <Get<GetInventoryResponse, unknown, void, void> path={`/store/inventory`} base={getConfig('petstore')} {...props} />
)

export type UseGetInventoryProps = Omit<UseGetProps<GetInventoryResponse, unknown, void, void>, 'path'>

/**
 * Returns pet inventories by status
 *
 * Returns a map of status codes to quantities
 */
export const useGetInventory = (props: UseGetInventoryProps) =>
  useGet<GetInventoryResponse, unknown, void, void>(`/store/inventory`, {
    base: getConfig('petstore'),
    ...props
  })

export type PlaceOrderProps = Omit<MutateProps<Order, void, void, Order, void>, 'path' | 'verb'>

/**
 * Place an order for a pet
 */
export const PlaceOrder = (props: PlaceOrderProps) => (
  <Mutate<Order, void, void, Order, void> verb="POST" path={`/store/order`} base={getConfig('petstore')} {...props} />
)

export type UsePlaceOrderProps = Omit<UseMutateProps<Order, void, void, Order, void>, 'path' | 'verb'>

/**
 * Place an order for a pet
 */
export const usePlaceOrder = (props: UsePlaceOrderProps) =>
  useMutate<Order, void, void, Order, void>('POST', `/store/order`, {
    base: getConfig('petstore'),
    ...props
  })

export type DeleteOrderProps = Omit<MutateProps<void, void, void, number, void>, 'path' | 'verb'>

/**
 * Delete purchase order by ID
 *
 * For valid response try integer IDs with positive integer value. Negative or non-integer values will generate API errors
 */
export const DeleteOrder = (props: DeleteOrderProps) => (
  <Mutate<void, void, void, number, void> verb="DELETE" path={`/store/order`} base={getConfig('petstore')} {...props} />
)

export type UseDeleteOrderProps = Omit<UseMutateProps<void, void, void, number, void>, 'path' | 'verb'>

/**
 * Delete purchase order by ID
 *
 * For valid response try integer IDs with positive integer value. Negative or non-integer values will generate API errors
 */
export const useDeleteOrder = (props: UseDeleteOrderProps) =>
  useMutate<void, void, void, number, void>('DELETE', `/store/order`, {
    base: getConfig('petstore'),
    ...props
  })

export interface GetOrderByIdPathParams {
  /**
   * ID of pet that needs to be fetched
   */
  orderId: number
}

export type GetOrderByIdProps = Omit<GetProps<Order, void, void, GetOrderByIdPathParams>, 'path'> &
  GetOrderByIdPathParams

/**
 * Find purchase order by ID
 *
 * For valid response try integer IDs with value >= 1 and <= 10. Other values will generated exceptions
 */
export const GetOrderById = ({ orderId, ...props }: GetOrderByIdProps) => (
  <Get<Order, void, void, GetOrderByIdPathParams>
    path={`/store/order/${orderId}`}
    base={getConfig('petstore')}
    {...props}
  />
)

export type UseGetOrderByIdProps = Omit<UseGetProps<Order, void, void, GetOrderByIdPathParams>, 'path'> &
  GetOrderByIdPathParams

/**
 * Find purchase order by ID
 *
 * For valid response try integer IDs with value >= 1 and <= 10. Other values will generated exceptions
 */
export const useGetOrderById = ({ orderId, ...props }: UseGetOrderByIdProps) =>
  useGet<Order, void, void, GetOrderByIdPathParams>(
    (paramsInPath: GetOrderByIdPathParams) => `/store/order/${paramsInPath.orderId}`,
    { base: getConfig('petstore'), pathParams: { orderId }, ...props }
  )

export type CreateUserProps = Omit<MutateProps<void, void, void, User, void>, 'path' | 'verb'>

/**
 * Create user
 *
 * This can only be done by the logged in user.
 */
export const CreateUser = (props: CreateUserProps) => (
  <Mutate<void, void, void, User, void> verb="POST" path={`/user`} base={getConfig('petstore')} {...props} />
)

export type UseCreateUserProps = Omit<UseMutateProps<void, void, void, User, void>, 'path' | 'verb'>

/**
 * Create user
 *
 * This can only be done by the logged in user.
 */
export const useCreateUser = (props: UseCreateUserProps) =>
  useMutate<void, void, void, User, void>('POST', `/user`, {
    base: getConfig('petstore'),
    ...props
  })

export type CreateUsersWithArrayInputProps = Omit<
  MutateProps<void, void, void, UserArrayRequestBody, void>,
  'path' | 'verb'
>

/**
 * Creates list of users with given input array
 */
export const CreateUsersWithArrayInput = (props: CreateUsersWithArrayInputProps) => (
  <Mutate<void, void, void, UserArrayRequestBody, void>
    verb="POST"
    path={`/user/createWithArray`}
    base={getConfig('petstore')}
    {...props}
  />
)

export type UseCreateUsersWithArrayInputProps = Omit<
  UseMutateProps<void, void, void, UserArrayRequestBody, void>,
  'path' | 'verb'
>

/**
 * Creates list of users with given input array
 */
export const useCreateUsersWithArrayInput = (props: UseCreateUsersWithArrayInputProps) =>
  useMutate<void, void, void, UserArrayRequestBody, void>('POST', `/user/createWithArray`, {
    base: getConfig('petstore'),
    ...props
  })

export type CreateUsersWithListInputProps = Omit<
  MutateProps<void, void, void, UserArrayRequestBody, void>,
  'path' | 'verb'
>

/**
 * Creates list of users with given input array
 */
export const CreateUsersWithListInput = (props: CreateUsersWithListInputProps) => (
  <Mutate<void, void, void, UserArrayRequestBody, void>
    verb="POST"
    path={`/user/createWithList`}
    base={getConfig('petstore')}
    {...props}
  />
)

export type UseCreateUsersWithListInputProps = Omit<
  UseMutateProps<void, void, void, UserArrayRequestBody, void>,
  'path' | 'verb'
>

/**
 * Creates list of users with given input array
 */
export const useCreateUsersWithListInput = (props: UseCreateUsersWithListInputProps) =>
  useMutate<void, void, void, UserArrayRequestBody, void>('POST', `/user/createWithList`, {
    base: getConfig('petstore'),
    ...props
  })

export interface LoginUserQueryParams {
  /**
   * The user name for login
   */
  username: string
  /**
   * The password for login in clear text
   */
  password: string
}

export type LoginUserProps = Omit<GetProps<string, void, LoginUserQueryParams, void>, 'path'>

/**
 * Logs user into the system
 */
export const LoginUser = (props: LoginUserProps) => (
  <Get<string, void, LoginUserQueryParams, void> path={`/user/login`} base={getConfig('petstore')} {...props} />
)

export type UseLoginUserProps = Omit<UseGetProps<string, void, LoginUserQueryParams, void>, 'path'>

/**
 * Logs user into the system
 */
export const useLoginUser = (props: UseLoginUserProps) =>
  useGet<string, void, LoginUserQueryParams, void>(`/user/login`, {
    base: getConfig('petstore'),
    ...props
  })

export type LogoutUserProps = Omit<GetProps<void, void, void, void>, 'path'>

/**
 * Logs out current logged in user session
 */
export const LogoutUser = (props: LogoutUserProps) => (
  <Get<void, void, void, void> path={`/user/logout`} base={getConfig('petstore')} {...props} />
)

export type UseLogoutUserProps = Omit<UseGetProps<void, void, void, void>, 'path'>

/**
 * Logs out current logged in user session
 */
export const useLogoutUser = (props: UseLogoutUserProps) =>
  useGet<void, void, void, void>(`/user/logout`, {
    base: getConfig('petstore'),
    ...props
  })

export type DeleteUserProps = Omit<MutateProps<void, void, void, string, void>, 'path' | 'verb'>

/**
 * Delete user
 *
 * This can only be done by the logged in user.
 */
export const DeleteUser = (props: DeleteUserProps) => (
  <Mutate<void, void, void, string, void> verb="DELETE" path={`/user`} base={getConfig('petstore')} {...props} />
)

export type UseDeleteUserProps = Omit<UseMutateProps<void, void, void, string, void>, 'path' | 'verb'>

/**
 * Delete user
 *
 * This can only be done by the logged in user.
 */
export const useDeleteUser = (props: UseDeleteUserProps) =>
  useMutate<void, void, void, string, void>('DELETE', `/user`, {
    base: getConfig('petstore'),
    ...props
  })

export interface GetUserByNamePathParams {
  /**
   * The name that needs to be fetched. Use user1 for testing.
   */
  username: string
}

export type GetUserByNameProps = Omit<GetProps<User, void, void, GetUserByNamePathParams>, 'path'> &
  GetUserByNamePathParams

/**
 * Get user by user name
 */
export const GetUserByName = ({ username, ...props }: GetUserByNameProps) => (
  <Get<User, void, void, GetUserByNamePathParams> path={`/user/${username}`} base={getConfig('petstore')} {...props} />
)

export type UseGetUserByNameProps = Omit<UseGetProps<User, void, void, GetUserByNamePathParams>, 'path'> &
  GetUserByNamePathParams

/**
 * Get user by user name
 */
export const useGetUserByName = ({ username, ...props }: UseGetUserByNameProps) =>
  useGet<User, void, void, GetUserByNamePathParams>(
    (paramsInPath: GetUserByNamePathParams) => `/user/${paramsInPath.username}`,
    { base: getConfig('petstore'), pathParams: { username }, ...props }
  )

export interface UpdateUserPathParams {
  /**
   * name that need to be updated
   */
  username: string
}

export type UpdateUserProps = Omit<MutateProps<void, void, void, User, UpdateUserPathParams>, 'path' | 'verb'> &
  UpdateUserPathParams

/**
 * Updated user
 *
 * This can only be done by the logged in user.
 */
export const UpdateUser = ({ username, ...props }: UpdateUserProps) => (
  <Mutate<void, void, void, User, UpdateUserPathParams>
    verb="PUT"
    path={`/user/${username}`}
    base={getConfig('petstore')}
    {...props}
  />
)

export type UseUpdateUserProps = Omit<UseMutateProps<void, void, void, User, UpdateUserPathParams>, 'path' | 'verb'> &
  UpdateUserPathParams

/**
 * Updated user
 *
 * This can only be done by the logged in user.
 */
export const useUpdateUser = ({ username, ...props }: UseUpdateUserProps) =>
  useMutate<void, void, void, User, UpdateUserPathParams>(
    'PUT',
    (paramsInPath: UpdateUserPathParams) => `/user/${paramsInPath.username}`,
    { base: getConfig('petstore'), pathParams: { username }, ...props }
  )
