module ApplicationHelper

   def getLogin
     if current_user.nil?
       return "user not signed in"
    else
      return current_user.email
   end
  end

end
