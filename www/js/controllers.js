var app_url = 'http://aesthetictoday.com/ajax/merchant-ios/merchant_app_json.php';
angular.module('AesthetiTodayMerchant.controllers', [])

.controller('AuthCtrl', function($scope, $ionicConfig,$rootScope, $state, $ionicLoading) {
	$rootScope.localsave = function(userdata){
	    if(userdata){
	      $rootScope.userdata = userdata;
	      localStorage.setItem('userdata', JSON.stringify(userdata));
	      $state.go('app.feeds-categories');
	    }else{
	      $rootScope.userdata = localStorage.getItem('userdata');
	      if($rootScope.userdata!=null){
	        $rootScope.userdata = JSON.parse($rootScope.userdata);
	        $state.go('app.feeds-categories');
	      }else{
	        $rootScope.userdata = false;
	      }
	    }
  	}

  	$rootScope.clearlocaldata = function(){
	    localStorage.removeItem("userdata");
	    $rootScope.userdata = false;
	    $rootScope.userid = false;
	    $rootScope.isuserloggedin = false;
	    $rootScope.logout = true;
  	}
  	$rootScope.localsave();
})

// APP
.controller('AppCtrl', function($scope, $ionicConfig, $rootScope, $ionicActionSheet, $state) {
	// Triggered on a the logOut button click
	$scope.showLogOutMenu = function() {

		// Show the action sheet
		var hideSheet = $ionicActionSheet.show({
			//Here you can add some more buttons
			// buttons: [
			// { text: '<b>Share</b> This' },
			// { text: 'Move' }
			// ],
			destructiveText: 'Logout',
			titleText: 'Are you sure you want to logout?',
			cancelText: 'Cancel',
			cancel: function() {
				// add cancel code..
			},
			buttonClicked: function(index) {
				$rootScope.logoutSuccess();
				//Called when one of the non-destructive buttons is clicked,
				//with the index of the button that was clicked and the button object.
				//Return true to close the action sheet, or false to keep it opened.
				return true;
			},
			destructiveButtonClicked: function(){
				$rootScope.logoutSuccess();
				//Called when the destructive button is clicked.
				//Return true to close the action sheet, or false to keep it opened.
				//$state.go('auth.walkthrough');
			}
		});

	};

	$rootScope.logoutSuccess = function(){
	    localStorage.removeItem("userdata");
	    $rootScope.userdata = false;
	    $rootScope.userid = false;
	    $rootScope.isuserloggedin = false;
	    $rootScope.logout = true;
	    $state.go('auth.walkthrough');
  	}
})

//LOGIN
.controller('LoginCtrl', function($scope, $state, $templateCache, $q, $rootScope,$timeout, $ionicLoading, $http) {
	
	$scope.doLogIn = function() {
		$ionicLoading.show({
			template: 'Loading...'
		});
            $http.post(app_url, {merchantlogin:'yes',username:$scope.user.email,psd:$scope.user.password}).
              then(function(response) {
                if(response.data.status == 'success'){
                  $rootScope.localsave(response.data.userdata);
                  $rootScope.isuserloggedin = true;
                  $rootScope.logout = false;
                  $rootScope.userid = response.data.userdata.ID;
                  $state.go('app.feeds-categories');
                }else if(response.data.status == 'access denied'){
                	$scope.isError = true;
                    $scope.error_Message = 'Only Merchants can Login!';
					$timeout(function() { 
			                $scope.isError = false;
			        }, 2500);
			        $rootScope.clearlocaldata();
                }else{
                	$scope.isError = true;
                	$scope.error_Message = 'Wrong Username or Password';
					$timeout(function() { 
			                $scope.isError = false;
			        }, 2500);
			        $rootScope.clearlocaldata();
                }
                $ionicLoading.hide();
              },function(response) {
              		$scope.isError = true;
              		$scope.error_Message = 'Login Error!';
					$timeout(function() { 
			                $scope.isError = false;
			         }, 2500);
                	$ionicLoading.hide();
                	$rootScope.clearlocaldata();
          });
    };

	$scope.user = {};
	$scope.isError = false;
	$scope.error_Message = '';

	/*$scope.user.email = "john@doe.com";
	$scope.user.pin = "12345";*/

	// We need this for the form validation
	$scope.selected_tab = "";

	$scope.$on('my-tabs-changed', function (event, data) {
		$scope.selected_tab = data.title;
	});

})

.controller('SignupCtrl', function($scope, $state) {
	$scope.user = {};

	$scope.user.email = "john@doe.com";

	$scope.doSignUp = function(){
		$state.go('app.feeds-categories');
	};
})

.controller('ForgotPasswordCtrl', function($scope, $state) {
	$scope.recoverPassword = function(){
		$state.go('app.feeds-categories');
	};

	$scope.user = {};
})

//redeem page controller
.controller('FeedsCategoriesCtrl', function($scope, $http, $rootScope, $state,$timeout,$ionicLoading) {
	
	$rootScope.voucher = {};
	/*$rootScope.voucher.code = 'QbO25XJQ';*/

	if(!$rootScope.userdata || $rootScope.userdata == null){
	    $rootScope.userdata = localStorage.getItem('userdata');
	      if($rootScope.userdata != 'undefined'){
	        $rootScope.userdata = JSON.parse($rootScope.userdata);
	      }else{
	        $rootScope.userdata = false;
	        $state.go('auth.login');
	      }
	}
	if($rootScope.userdata==null || $rootScope.userdata.ID=="" || $rootScope.userdata.ID==undefined){
		$state.go('auth.login');
	}

	$scope.getvoucherdetails = function(){
		$ionicLoading.show({
			template: 'Verifying Voucher...'
		});
		$timeout(function() {
	        if($rootScope.voucher.code != '' && $rootScope.userdata.ID){
	        	$http.post(app_url, {voucherinfo:'yes',merchantid:$rootScope.userdata.ID,code:$rootScope.voucher.code}).
	              then(function(response) {
	                if(response.data && response.data.status == 'failed'){
	                  $rootScope.voucher.message = 'Invalid Voucher Code!';
	                  $ionicLoading.show({
						template: $rootScope.voucher.message
				       });
	                  $timeout(function() { 
			                $ionicLoading.hide();
			          }, 2500);
	                }
	                if(response.data && response.data.status == 'other merchant voucher'){
	                  $rootScope.voucher.message = 'This Voucher not belongs to your Spa!';
	                  $ionicLoading.show({
						template: $rootScope.voucher.message
				       });
	                  $timeout(function() { 
			                $ionicLoading.hide();
			          }, 2500);
	                }
	                if(response.data && response.data.status == 'already exchanged'){
	                  $rootScope.voucher.details = response.data;
	                  $rootScope.voucher.status = false;
	                  $rootScope.voucher.message = 'You cannot redeem an exchanged Voucher!';
	                  $ionicLoading.show({
						template: $rootScope.voucher.message
				       });
	                  $timeout(function() { 
			                $ionicLoading.hide();
			                $state.go('app.category-feeds', { categoryId: 'voucher'});
			          }, 2500);
	                  //$location.path('redeemconfirm');
	                  //$state.go('auth.login');
	                }
	                if(response.data && response.data.status == 'already redeemed'){
	                  $rootScope.voucher.details = response.data;
	                  $rootScope.voucher.status = false;
	                  $rootScope.voucher.message = 'This Voucher is already Redeemed!';
	                  $ionicLoading.show({
						template: $rootScope.voucher.message
				       });
	                  //$location.path('redeemconfirm');
	                  //$state.go('auth.login');
	                  $timeout(function() {
			                $ionicLoading.hide();
			                $state.go('app.category-feeds', { categoryId: 'voucher'});
			          }, 2500);
	                }
	                if(response.data && response.data.status == 'success'){
	                  $rootScope.voucher.details = response.data;
	                  $rootScope.voucher.status = true;
	                  $rootScope.voucher.message = 'Active! You can Redeem it Now!';
	                  $ionicLoading.show({
						template: $rootScope.voucher.message
				       });
	                  //$location.path('redeemconfirm');
	                  //$state.go('auth.login');
	                  $timeout(function() { 
			                $ionicLoading.hide();
			                $state.go('app.category-feeds', { categoryId: 'voucher'});
			          }, 2500);
	                }
	                $timeout(function() { 
			                $ionicLoading.hide();
			        }, 5000);
	              },function(response) {
	              	$rootScope.voucher.message = 'Error Accessing Voucher Info!';
	              	$ionicLoading.show({
						template: $rootScope.voucher.message
				       });
	                $timeout(function() { 
			                $ionicLoading.hide();
			        }, 2500);
	          });
	        }else{
	          $rootScope.voucher.message = 'Enter Voucher Code!';
	          $ionicLoading.show({
						template: $rootScope.voucher.message
				       });
	          $timeout(function() { 
	          	$ionicLoading.hide();
			  }, 2500);
	        }
	      }, 50);
	}

	$scope.aestheticScanCode = function(){
      cordova.plugins.barcodeScanner.scan(
        function (result) {
            /*var s = "Result: " + result.text + "<br/>" +
            "Format: " + result.format + "<br/>" +
            "Cancelled: " + result.cancelled;*/
            $rootScope.voucher.code = result.text;
            $rootScope.$apply();
            $scope.getvoucherdetails();
        },
        function (error) {
        	$ionicLoading.show({
        		template: 'Scanning failed: ' +error
			});
			$timeout(function() { 
	          	$ionicLoading.hide();
			}, 2500);
        }
      );
    }

    $ionicLoading.hide();
	/*$scope.feeds_categories = [];

	$http.get('feeds-categories.json').success(function(response) {
		$scope.feeds_categories = response;
	});*/
})

//bring specific category providers
.controller('CategoryFeedsCtrl', function($scope,$rootScope, $http, $stateParams,$timeout,$state,$ionicLoading) {
	
	$scope.categoryId = $stateParams.categoryId;
	if($scope.categoryId=='voucher'){
		//voucher details code
		$scope.categoryTitle = 'Redeem Voucher';
		if($rootScope.voucher==undefined || !$rootScope.voucher.details || $rootScope.voucher.details.post_title ==''){
		    $state.go('app.feeds-categories');
		}
		else{
			$scope.voucherdetails = $rootScope.voucher.details;
		}

	}else if($scope.categoryId=='news'){
		$http.get('feeds-categories.json').success(function(response) {
			var category = _.find(response, {id: $scope.categoryId});
			$scope.categoryTitle = category.title;
			$scope.category_sources = category.feed_sources;
		});
	}

	$scope.redeemvoucher = function(){
		$ionicLoading.show({
			template: 'Redeeming Voucher...'
		});
		if($scope.voucherdetails){
		   	//input: voucherdetails.deal_id,voucherdetails.reff_code,voucherdetails.merchant_id,voucherdetails.purchased_user_id
		    $http.post(app_url, {redeemvoucher:'yes',
		    	merchantid:$scope.voucherdetails.merchant_id,
		    	cart_detail_id:$scope.voucherdetails.cart_detail_id,
		    	purchaseuserid:$scope.voucherdetails.purchased_user_id,
		    	dealid:$scope.voucherdetails.deal_id,
		    	vouchercode:$scope.voucherdetails.reff_code
		    }).
		    then(function(response) {
		    	if(response.data.status == 'failed'){
		    		$scope.redeemvoucher.status = false;
		    	}
		    	if(response.data.status == 'success'){
		    		$scope.redeemvoucher.status = true;
		    		$ionicLoading.show({
						template: 'Voucher Redeemed Successfully!'
					});
					$timeout(function() { 
			          	$ionicLoading.hide();
			          	$state.go('app.feeds-categories');
					}, 2500);
		    		$rootScope.globalmessage = 'Voucher Redeemed Successfully!';
		    	}
		    },function(response) {
		    	$ionicLoading.show({
					template: 'Error Redeeming Voucher!'
				});
				$timeout(function() { 
		          	$ionicLoading.show({
						template: 'Please Check your Connection!'
					});
					$timeout(function() { 
			          	$ionicLoading.hide();
					}, 2500);
				}, 2500);
		    });
		}else{
			$ionicLoading.show({
				template: 'Error Redeeming Voucher!'
			});
			$timeout(function() { 
	          	$ionicLoading.hide();
			}, 2500);
		}
	}
	
})

// used vouchers page
.controller('usedvouchersCtrl', function($scope,$http, $rootScope, $state,$ionicLoading, $timeout) {

	$ionicLoading.show({
		template: 'Loading...'
	});
	if($rootScope.userdata && $rootScope.userdata.ID){
		$rootScope.userid = $rootScope.userdata.ID;
		$rootScope.isuserloggedin = true;
	}else{
		$state.go('auth.walkthrough');
	}
  	$scope.usedvoucher = {};
  	
  	$scope.getUsedVouchers = function(){
  		if($rootScope.isuserloggedin && $rootScope.userid){
          $http.post(app_url, {usedvoucherinfo:'yes',merchantid:$rootScope.userid}).
              then(function(response) {
                if(response.data.status == 'failed'){
                  $scope.usedvoucher.status = false;
                }
                if(response.data.status == 'success'){
                  $scope.usedvoucher.status = true;
                  $scope.usedvoucher.data = response.data.data;

                }
                $ionicLoading.hide();
              },function(response) {
              	$ionicLoading.show({
					template: 'Error Accessing Used Vouchers!'
				});
              	$timeout(function() { 
		          	$ionicLoading.hide();
				}, 2500);
          });
  		}
  	}
  	$scope.getUsedVouchers();

  	$scope.doRefresh = function() {
		$scope.getUsedVouchers();
		$timeout(function() { 
			$scope.$broadcast('scroll.refreshComplete');
		}, 2500);
	};

	/*$scope.bookmarks = BookMarkService.getBookmarks();

	// When a new post is bookmarked, we should update bookmarks list
	$rootScope.$on("new-bookmark", function(event){
		$scope.bookmarks = BookMarkService.getBookmarks();
	});

	$scope.goToFeedPost = function(link){
		window.open(link, '_blank', 'location=yes');
	};
	$scope.goToWordpressPost = function(postId){
		$state.go('app.post', {postId: postId});
	};*/
})
//activedealsCtrl
.controller('activedealsCtrl', function($scope,$http, $rootScope, $state,$ionicLoading, $timeout) {

	$ionicLoading.show({
		template: 'Loading...'
	});
	if($rootScope.userdata && $rootScope.userdata.ID){
		$rootScope.userid = $rootScope.userdata.ID;
		$rootScope.isuserloggedin = true;
	}else{
		$state.go('auth.walkthrough');
	}
  	$scope.activedeals = {};
  	
  	$scope.getActiveDeals = function(){
		  if($rootScope.isuserloggedin && $rootScope.userid){
		          $http.post(app_url, {merchantactivedeals:'yes',merchantid:$rootScope.userid}).
		              then(function(response) {
		                if(response.data.status == 'failed'){
		                  $scope.activedeals.status = false;
		                }
		                if(response.data.status == 'success'){
		                  $scope.activedeals.status = true;
		                  $scope.activedeals.data = response.data.data;

		                }
		                $ionicLoading.hide();
		              },function(response) {
		                $ionicLoading.show({
							template: 'Error Accessing Active Deals!'
						});
		              	$timeout(function() { 
				          	$ionicLoading.hide();
						}, 2500);
		          });
		  }
  	}
  	$scope.getActiveDeals();

  	$scope.doRefresh = function() {
		$scope.getActiveDeals();
		$timeout(function() {
			$scope.$broadcast('scroll.refreshComplete');
		}, 2500);
	}
})
;
