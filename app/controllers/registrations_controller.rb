require 'json'

class RegistrationsController < Devise::RegistrationsController

  def initialize
    #creating the subscriptions
    monthly = {:description => "monthly", :subscription_key => "1", :price => "$4.99"}
    yearly = {:description => "yearly", :subscription_key => "2", :price => "$39.99"}
    @subscriptions = [monthly, yearly]
    puts "hellp"
    super
  end

  def create  
    if userExists(params["email"])
      flash["error"] = "User already exists. Please login insted of signing up."
      redirect("/users/sign_in")
      return
    end    
    if (params["password_confirmation"] != params["password"])
         flash["error"] = "Your password and password confirmation must be the same"
         redirect("/users/sign_up")
         return
    end
    #render action: "payment_start" #add this when using the payment method
    session[:email] = params["email"]
    session[:password] = params["password"]
    session[:conf] = params["password_confirmation"]
    session[:payment_necessary] = false	#change this value to true once we start using the payment method
#    session[:referer] = params["referer"]
    payment	#remove this when using a payment method
  end

#creating users, plus adding them to the Stripe system
  def payment
    email = session["email"]
    password =  session["password"]
    conf = session["password_confirmation"]    
    if session[:payment_necessary] == true
      subs = pay(email, params["price"], params["stripe_card_token"])
      if not subs				#if the subscription failed, its value is false
        return
      end
    else
      subs = "none"
    end
    
    if not userExists(email)		#verifying if the user is already in the system
      begin
        @user = User.new(:email => email, :password => password, :password_confirmation => conf, :subscription => subs)
        @user.save
      rescue => e
         flash["error"] = "We have encountered and error\n" + e.message
         redirect("/users/sign_up")
        return
      end
    else
      flash["error"] = "User already exists. Please login insted of signing up."
      redirect("/users/sign_in")
      return
    end
    sign_in :user, @user
    #testing if we got here from one of ourr sale points. if so, we want to go to the get tools page
    getTool = false
#    File.foreach('public/referals.txt') {|referer| getTool = (session[:referer] == referer.strip) ?  true: getTool }
#    if getTool
      redirect("/downloads")      
#    else
#      redirect("/tags")
#    end
  end

  def redirect(view)
    session.delete("email")
    session.delete("password")
    session.delete("password_confirmation")
    redirect_to view
  end

  def userExists(email)
      user = User.find_by_email(email)
      return user
  end
  
  def pay(email, price, stripeToken)
    subscription_type = find_subscription(price, @subscriptions)
    begin
      costumer = create_customer(email, stripeToken, @subscription_type)
    rescue  => e
      flash["error"] = e.message
      render action: "payment_start"
      return false
    end
    subs = costumer.subscriptions.data[0]["id"]
    return subs
  end

  def create_customer(email, token, subs)
    customer = Stripe::Customer.create(
      :card => token,
      :email => email,
      :plan => subs
    )
    return customer
  end

#updating user info
  def update
    user = User.find_by_email(params[:email])
    if(user.password.eql? params[:current_password])
       sign_out user
       redirect_to "/users/sign_up"
    else
#      costumer = change_plan(user, data)
      if(data[:password].eql? data[:password_confirmation])
        puts "New password and Confirmation password are different."
      else
        user.password = params[:password]
      end
      user.save
      redirect_to "/tags"
    end
  end


  def change_plan(user, data)
    if(not @user.subscription.nil?)
      subscription = Stripe::Subscription.retrieve(user.subscription)
      subscription.plan = data[:subscription]
      subscription.save
    end
  end

  def find_subscription(price, subscriptions)
    subscriptions.each { |subs|
      if(price.eql?  subs[:price] )
        return subs[:subscription_key]
      end
    }
  end

#deleting users. requires at least the email
  def destroy
    user = User.find_by_email(session[:email])
    subscription = Stripe::Subscription.retrieve(@user.subscription)
    subscription.delete
    @user.destroy
    if @user.destroy
      redirect_to "/users/sign_up"
    end
  end

  def after_sign_up_path_for(resource)
    "/tags"
  end

#extra stuff thats required for it to work properly
  def resource_name
    :user
  end

  def sign_out(user)
    super(user)
  end

  def account_update_params
    devise_parameter_sanitizer.sanitize(:account_update)
  end

  def sign_up_params
    devise_parameter_sanitizer.sanitize(:sign_up)
  end

  def sign_up_params
    params.require(:user).permit(:stripe_card_token,  :email, :password, :password_confirmation, :subscription)
  end

  def account_update_params
    params.require(:user).permit(:stripe_card_token, :subscription, :email, :password, :password_confirmation, :current_password)
  end

  def resource
    @resource ||= User.new
  end

  def devise_mapping
    @devise_mapping ||= Devise.mappings[:user]
  end

  def after_sign_up_path_for(resource)
    super(resource)
  end

  def new
    super
  end
  
end
