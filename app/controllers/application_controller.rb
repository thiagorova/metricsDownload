include Devise::Controllers::Helpers

class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception,
    if: Proc.new { |c| c.request.format =~ %r{application/json} }
  before_filter :configure_permitted_parameters, if: :devise_controller?

  protected
  
   def configure_permitted_parameters
      devise_parameter_sanitizer.permit(:sign_up, keys: [:stripe_card_token, :subscription, :email, :password])
      devise_parameter_sanitizer.permit(:account_update, keys: [:stripe_card_token, :subscription, :email, :password])
   end
    
   def configure_permitted_parameters
         devise_parameter_sanitizer.for(:sign_in) { |u| u.permit(:email) }
         devise_parameter_sanitizer.for(:sign_up) { |u| u.permit(:stripe_card_token, :subscription, :email, :password) }
         devise_parameter_sanitizer.for(:account_update) { |u| u.permit(:subscription, :email, :password, :password_confirmation, :current_password, :subscription) }
   end
   
   # Confirms a logged-in user.
   def userLogin
      if current_user.nil?
         flash[:danger] = "Please register before using the system."
          redirect_to "/users/sign_up"
          return false
      end
      return true
   end
   
   #returns either user Login or his IP adress
   def getID
     if current_user.nil?
       return request.remote_ip
    else
      return current_user.email
   end
 end
   
end
