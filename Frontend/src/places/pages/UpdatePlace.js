import React, { useContext, useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { AuthContext } from '../../shared/components/context/auth-context'
import Button from '../../shared/components/FormElements/Button'
import Input from '../../shared/components/FormElements/Input'
import Card from '../../shared/components/UIElements/Card'
import ErrorModal from '../../shared/components/UIElements/ErrorModal'
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner'
import {
    VALIDATOR_MINLENGTH,
    VALIDATOR_REQUIRE,
} from '../../shared/components/util/validators'
import { useForm } from '../../shared/hooks/form-hooks'
import { useHttpClient } from '../../shared/hooks/http-hook'
import './PlaceForm.css'

const UpdatePlace = () => {
    const { isLoading, error, sendRequest, clearError } = useHttpClient()
    const [loadedPlace, setLoadedPlace] = useState()
    const placeId = useParams().placeId
    const history = useHistory()
    const auth = useContext(AuthContext)

    const [formState, inputHandler, setFormData] = useForm(
        {
            title: {
                value: '',
                isValid: false,
            },
            description: {
                value: '',
                isValid: false,
            },
        },
        false
    )

    useEffect(() => {
        const fetchPlace = async () => {
            try {
                const responseData = await sendRequest(
                    `http://localhost:5000/api/places/${placeId}`
                )

                //setLoadedPlace(1)
                //console.log(responseData.place);
                //setLoadedPlace(prevState=>(responseData.place))
                let loadingPlace = () => {
                    setLoadedPlace(responseData.place);
                }
                loadingPlace();
                setFormData(
                    {
                        title: {
                            value: responseData.place.title,
                            isValid: true,
                        },
                        description: {
                            value: responseData.place.description,
                            isValid: true,
                        },
                    },
                    true
                )
                //console.log(formState);
                //console.log(placeId);
            } catch (err) {
                console.log(err);
            }
        }
        fetchPlace();
    }, [sendRequest, placeId, setFormData])

    const placeUpdateSubmitHandler = async (event) => {
        event.preventDefault()
        try {
            await sendRequest(
                `http://localhost:5000/api/places/${placeId}`,
                'PATCH',
                JSON.stringify({
                    title: formState.inputs.title.value,
                    description: formState.inputs.description.value,
                }),
                {
                    'Content-Type': 'application/json',
                }
            )
            history.push('/' + auth.userId + '/places')
        } catch (err) {}
    }

    if (isLoading) {
        return (
            <div className="center">
                <LoadingSpinner />
            </div>
        )
    }

    if (!loadedPlace && !error) {
        return (
            <div className="center">
                <Card>
                    <h2>Could not find place!</h2>
                </Card>
            </div>
        )
    }

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {!isLoading && loadedPlace && (
                <form
                    className="place-form"
                    onSubmit={placeUpdateSubmitHandler}
                >
                    <Input
                        id="title"
                        element="input"
                        type="text"
                        label="Title"
                        validators={[VALIDATOR_REQUIRE()]}
                        errorText="Please enter a valid title."
                        onInput={inputHandler}
                        initialValue={loadedPlace.title}
                        initialValid={true}
                    />
                    <Input
                        id="description"
                        element="textarea"
                        label="Description"
                        validators={[VALIDATOR_MINLENGTH(5)]}
                        errorText="Please enter a valid description (min. 5 characters)."
                        onInput={inputHandler}
                        initialValue={loadedPlace.description}
                        initialValid={true}
                    />
                    <Button type="submit" disabled={!formState.isValid}>
                        UPDATE PLACE
                    </Button>
                </form>
            )}
        </React.Fragment>
    )
}

export default UpdatePlace