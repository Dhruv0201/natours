import axios from 'axios';
import { showAlert } from './alert'; 

export const updatSettings = async(data,type)=>{
    try{
        const url = type==="password" ? 'http://localhost:3000/api/v1/users/updatePassword'
                                       :'http://localhost:3000/api/v1/users/updateMe';
        const res = await axios ({
            method:'PATCH',
            url,
            data
        })
        if(res.data.status=='success'){
            showAlert('success',`${type.toUpperCase()} updated Successfully`)
        }
    }
    catch(err){
        showAlert('error',err.response.data.message)
    }
}